// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";

error NoBudgetForRefund();
error GasRefundFailed();

contract GovernorGasRefundProxy {
  mapping(address => uint256) balances;

  uint256 constant APPROX_AUX_GAS = 3000;

  event GovernorGasRefunded(address indexed target, address indexed voter, uint256 proposalId);

  function fund(address _target) public payable {
    // TODO: add ERC165 check to make sure contract compatible
    uint256 balance = balances[_target];

    balances[_target] = balance + msg.value;
  }

  function castVoteBySig(address _target, uint256 _proposalId, uint8 _support, uint8 _v, bytes32 _r, bytes32 _s) public returns (uint256) {
    uint256 gasUsed = gasleft();
    // execute vote
    IGovernor governor = IGovernor(_target);
    uint256 votes = governor.castVoteBySig(_proposalId, _support, _v, _r, _s);

    require(votes > 0, "voter below minumum votes for refund");

    uint256 balance = balances[_target];

    emit GovernorGasRefunded(_target, msg.sender, _proposalId);

    // refund gas (unless revert)
    gasUsed = gasUsed - gasleft();
    uint256 gasCost = (gasUsed * tx.gasprice) + (APPROX_AUX_GAS * tx.gasprice);
    // check if there is balance for the contract
    if (balance < gasCost) {
      revert NoBudgetForRefund();
    }

    // deduct the gast cost from the contract balance before sending to user
    balances[_target] = balance - gasCost;

    // refund the gas cost to msg.sender
    (bool success, ) = payable(msg.sender).call{value: gasCost}("");

    if (!success) {
      revert GasRefundFailed();
    }

    return votes;
  }
}
