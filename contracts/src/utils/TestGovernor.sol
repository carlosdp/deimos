// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract TestGovernor is Governor, GovernorVotes, GovernorCountingSimple, GovernorVotesQuorumFraction, GovernorSettings {
  constructor(IVotes _tokenAddress) Governor("TestGovernor") GovernorSettings(0, 10000000, 0) GovernorVotes(_tokenAddress) GovernorVotesQuorumFraction(10)  {
  }

  function proposalThreshold() public view virtual override(Governor, GovernorSettings) returns (uint256) {
    return 0;
  }
}
