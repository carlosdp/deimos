import { Box, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';

import { ProposalDetails } from '../hooks';
import { voteCountFormatter } from '../utils';

export type VotingCardProps = {
  proposal: ProposalDetails;
};

export const VotingCard = ({ proposal }: VotingCardProps) => {
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
    </Box>
  );
};
