import { ethers } from 'ethers';
import { useAccount, useContractRead } from 'wagmi';

const governorABI = [
  'function name() public view returns (string memory)',
  'function version() public view returns (string memory)',
  'function state(uint256 proposalId) public view returns (uint8)',
  'function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s)',
  'function getVotes(address account, uint256 blockNumber) public view returns (uint256)',
  'function hasVoted(uint256 proposalId, address account) public view returns (bool)',
  'function proposalSnapshot(uint256 proposalId) public view returns (uint256)',
];

export type AvailableVotesResult = {
  loading: boolean;
  active: boolean;
  hasVoted: boolean;
  votes: ethers.BigNumber;
};

export const useAvailableVotes = (contractId: string, proposalId: string): AvailableVotesResult => {
  const { data: account } = useAccount();
  const { data: snapshot, isLoading: snapshotLoading } = useContractRead(
    { addressOrName: contractId, contractInterface: governorABI },
    'proposalSnapshot',
    { args: [proposalId] }
  );
  const { data: votes, isLoading: votesLoading } = useContractRead(
    { addressOrName: contractId, contractInterface: governorABI },
    'getVotes',
    { args: [account, snapshot], enabled: !!account && !!snapshot }
  );
  const { data: hasVoted, isLoading: hasVotedLoading } = useContractRead(
    { addressOrName: contractId, contractInterface: governorABI },
    'hasVoted',
    { args: [proposalId, account], enabled: !!account }
  );
  const { data: state, isLoading: stateLoading } = useContractRead(
    { addressOrName: contractId, contractInterface: governorABI },
    'state',
    { args: [proposalId] }
  );

  return {
    loading: snapshotLoading || votesLoading || hasVotedLoading || stateLoading,
    active: !!state && state[0] === 1,
    hasVoted: hasVoted && hasVoted[0],
    votes: votes && votes[0],
  };
};
