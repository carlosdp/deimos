import { Box, Text, Button, Spinner } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useCallback } from 'react';

import { ProposalDetails, useSubmitVote, useAvailableVotes } from '../hooks';
import { voteCountFormatter } from '../utils';

export type VotingCardProps = {
  proposal: ProposalDetails;
};

export const VotingCard = ({ proposal }: VotingCardProps) => {
  const { vote } = useSubmitVote(proposal.governor.id, proposal.id);
  const {
    votes,
    hasVoted,
    loading: availableVotesLoading,
    active,
  } = useAvailableVotes(proposal.governor.id, proposal.proposalId);

  const voteFor = useCallback(() => {
    vote(1);
  }, [vote]);

  const voteAgainst = useCallback(() => {
    vote(0);
  }, [vote]);

  const votesFor = voteCountFormatter.format(Number.parseInt(ethers.utils.formatUnits(proposal.votesForCount, 18)));
  const votesAgainst = voteCountFormatter.format(
    Number.parseInt(ethers.utils.formatUnits(proposal.votesAgainstCount, 18))
  );

  return (
    <Box padding="20px" borderWidth="1px" borderStyle="solid" borderColor="black" borderRadius="4px">
      <Box gap="16px" display="flex">
        <Text fontWeight="bold">For</Text>
        <Text>{votesFor}</Text>
      </Box>
      <Box gap="16px" display="flex">
        <Text fontWeight="bold">Against</Text>
        <Text>{votesAgainst}</Text>
      </Box>
      <Box display="flex">
        {availableVotesLoading ? (
          <Spinner />
        ) : !active ? (
          <Text>Voting not active</Text>
        ) : hasVoted ? (
          <Text>You already voted on this proposal</Text>
        ) : (
          <>
            <Button onClick={voteFor}>{`Cast ${votes} For`}</Button>
            <Button onClick={voteAgainst}>{`Cast ${votes} Against`}</Button>
          </>
        )}
      </Box>
    </Box>
  );
};
