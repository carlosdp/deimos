// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../src/GovernorGasRefundProxy.sol";

import "../src/utils/TestToken.sol";
import "../src/utils/TestGovernor.sol";

contract GovernorGasRefundProxyTest is Test {
    bytes32 public constant BALLOT_TYPEHASH = keccak256("Ballot(uint256 proposalId,uint8 support)");
    bytes32 public constant EXTENDED_BALLOT_TYPEHASH =
        keccak256("ExtendedBallot(uint256 proposalId,uint8 support,string reason,bytes params)");

    TestToken token;
    TestGovernor governor;
    GovernorGasRefundProxy proxy;
    uint256 testProposalId;

    uint256 senderPrivateKey;
    address senderAddress;

    function setUp() public {
      TestToken _token = new TestToken();
      TestGovernor _governor = new TestGovernor(_token);
      GovernorGasRefundProxy _proxy = new GovernorGasRefundProxy();
      senderPrivateKey = vm.deriveKey("test test test test test test test test test test test junk", 0);
      senderAddress = vm.addr(senderPrivateKey);

      // prank an address with a known private key (so we can sign votes)
      vm.startPrank(senderAddress);
      _token.mint();
      _token.delegate(senderAddress);
      vm.deal(senderAddress, 1 ether);

      address[] memory _targets = new address[](1);
      _targets[0] = address(1);
      uint256[] memory _values = new uint256[](1);
      bytes[] memory _callDatas = new bytes[](1);

      // create test proposal
      testProposalId = _governor.propose(_targets, _values, _callDatas, "Test proposal");

      // advance block number by 1 so governance vote activates
      vm.roll(block.number + 1);

      token = _token;
      governor = _governor;
      proxy = _proxy;
    }

    function _hashTypedDataV4(bytes32 structHash) internal view returns (bytes32) {
      bytes32 typeHash = keccak256(
          "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
      );
      bytes32 nameHash = keccak256(bytes(governor.name()));
      bytes32 versionHash = keccak256(bytes(governor.version()));

      return ECDSA.toTypedDataHash(keccak256(abi.encode(typeHash, nameHash, versionHash, block.chainid, address(governor))), structHash);
    }

    function testRevertOnInvalidSignature() public {
      proxy.fund{value: 0.5 ether}(address(governor));

      (uint8 _v, bytes32 _r, bytes32 _s) = vm.sign(senderPrivateKey, keccak256("hello world"));
      vm.expectRevert("voter below minumum votes for refund");
      proxy.castVoteBySig(address(governor), testProposalId, 1, _v, _r, _s);
    }

    function testSubmitsVote() public {
      proxy.fund{value: 0.5 ether}(address(governor));

      (uint8 _v, bytes32 _r, bytes32 _s) = vm.sign(senderPrivateKey, _hashTypedDataV4(keccak256(abi.encode(BALLOT_TYPEHASH, testProposalId, uint8(1)))));
      uint256 voteCount = proxy.castVoteBySig(address(governor), testProposalId, 1, _v, _r, _s);

      require(governor.hasVoted(testProposalId, senderAddress), "vote not counted");
      require(voteCount > 0, "vote count should be > 0");
    }

    function testRefundsTotalGasCost() public {
      vm.fee(tx.gasprice);
      proxy.fund{value: 0.5 ether}(address(governor));

      (uint256 totalGasCost, uint256 refund) = _measureCastVoteGas();

      // whole gas cost must be refunded
      require(refund >= totalGasCost, "gas refund less than gas spent");

      // gas refund shouldn't exceed approx +10% of total actual gas cost
      require(refund <= totalGasCost + (totalGasCost/10), "gas refund greater than +10% total gas");
    }

    function testRefundsIfPriorityFeeBelow10PercentOfBaseFee() public {
      vm.fee((tx.gasprice/100)*91);
      proxy.fund{value: 0.5 ether}(address(governor));

      (uint256 totalGasCost, uint256 refund) = _measureCastVoteGas();

      // whole gas cost must be refunded
      require(refund >= totalGasCost, "gas refund less than gas spent");
    }

    function testDoesNotRefundIfPriorityFeeAbove10PercentOfBaseFee() public {
      vm.fee((tx.gasprice/10)*8);
      proxy.fund{value: 0.5 ether}(address(governor));

      (, uint256 refund) = _measureCastVoteGas();

      // no gas should be refunded
      require(refund == 0, "gas refund should be 0");
    }

    function _measureCastVoteGas() internal returns (uint256 totalGasCost, uint256 refund) {
      (uint8 _v, bytes32 _r, bytes32 _s) = vm.sign(senderPrivateKey, _hashTypedDataV4(keccak256(abi.encode(BALLOT_TYPEHASH, testProposalId, uint8(1)))));

      uint256 balanceBefore = senderAddress.balance;
      uint256 gasLeftBeforeCall = gasleft();

      proxy.castVoteBySig(address(governor), testProposalId, 1, _v, _r, _s);

      uint256 gasLeftAfterCall = gasleft();
      uint256 totalGasUsed = gasLeftBeforeCall - gasLeftAfterCall - 8109;
      uint256 balanceAfter = senderAddress.balance;
      refund = balanceAfter - balanceBefore;
      totalGasCost = totalGasUsed * tx.gasprice;
    }
}
