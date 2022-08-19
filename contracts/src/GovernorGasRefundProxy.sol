// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";

error NoBudgetForRefund();
error GasRefundFailed();
error NoValueForPool();
error NotPoolOwner();
error ClosePoolFailed();
error InvalidPool();

contract GovernorGasRefundProxy {
  struct RefundPool {
    address owner;
    uint256 balance;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
  }

  mapping(address => mapping(uint256 => RefundPool)) refundPools;

  uint256 constant REFUND_GAS_OVERHEAD = 3900;

  event RefundPoolCreated(address indexed governor, uint256 indexed poolId, address indexed owner, uint256 balance, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas);
  event RefundPoolBalanceAdded(address indexed governor, uint256 indexed poolId, uint256 amountAdded);
  event RefundPoolClosed(address indexed governor, uint256 indexed poolId);
  event GasRefunded(address indexed governor, uint256 indexed poolId, address indexed voter, uint256 proposalId, uint256 amountRefunded);

  function createPool(address _governor, uint256 _maxFeePerGas, uint256 _maxPriorityFeePerGas) public payable returns (uint256) {
    if (msg.value == 0) {
      revert NoValueForPool();
    }

    RefundPool memory pool;
    pool.owner = msg.sender;
    pool.balance = msg.value;
    pool.maxFeePerGas = _maxFeePerGas;
    pool.maxPriorityFeePerGas = _maxPriorityFeePerGas;

    uint256 poolId = uint256(keccak256(abi.encode(msg.sender, _maxFeePerGas, _maxPriorityFeePerGas)));

    refundPools[_governor][poolId] = pool;

    emit RefundPoolCreated(_governor, poolId, msg.sender, pool.balance, _maxFeePerGas, _maxPriorityFeePerGas);

    return poolId;
  }

  function closePool(address _governor, uint256 _poolId) public {
    RefundPool storage pool = refundPools[_governor][_poolId];

    if (pool.owner != msg.sender) {
      revert NotPoolOwner();
    }

    uint256 poolBalance = pool.balance;
    delete refundPools[_governor][_poolId];

    (bool success, ) = payable(msg.sender).call{value: poolBalance}("");

    if (!success) {
      revert ClosePoolFailed();
    }

    emit RefundPoolClosed(_governor, _poolId);
  }

  function fund(address _governor, uint256 _poolId) public payable {
    RefundPool storage pool = refundPools[_governor][_poolId];

    if (pool.owner == address(0)) {
      revert InvalidPool();
    }

    pool.balance += msg.value;
  }

  function castVoteBySig(address _governor, uint256 _poolId, uint256 _proposalId, uint8 _support, uint8 _v, bytes32 _r, bytes32 _s) public returns (uint256) {
    uint256 gasUsed = gasleft();
    uint256 votes;

    {
      // execute vote
      IGovernor governor = IGovernor(_governor);
      votes = governor.castVoteBySig(_proposalId, _support, _v, _r, _s);

      require(votes > 0, "voter below minumum votes for refund");
    }

    RefundPool storage pool = refundPools[_governor][_poolId];

    // if fee is greater than pool max fee, we don't refund
    if (pool.maxFeePerGas > 0 && tx.gasprice > pool.maxFeePerGas) {
      return votes;
    }

    {
      uint256 priorityFee = tx.gasprice - block.basefee;

      // if priority fee is greater than pool max priority fee, we don't refund
      if (pool.maxPriorityFeePerGas > 0 && priorityFee > pool.maxPriorityFeePerGas) {
        return votes;
      }
    }

    // refund gas (unless revert)
    gasUsed = gasUsed - gasleft();
    uint256 gasCost = (gasUsed * tx.gasprice) + (REFUND_GAS_OVERHEAD * tx.gasprice);

    // if there isn't enough to cover the gas cost, refund as much as we can
    if (pool.balance < gasCost) {
      gasCost = pool.balance;
    }

    // deduct the gas cost from the contract balance before sending to user
    pool.balance = pool.balance - gasCost;

    // refund the gas cost to msg.sender
    (bool success, ) = payable(msg.sender).call{value: gasCost}("");

    if (!success) {
      revert GasRefundFailed();
    }

    emit GasRefunded(_governor, _poolId, msg.sender, _proposalId, gasCost);

    return votes;
  }
}
