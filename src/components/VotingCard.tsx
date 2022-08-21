import {
  Box,
  Text,
  Button,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { faThumbsUp, faThumbsDown, faInfoCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ethers } from 'ethers';
import { useCallback } from 'react';

import { ProposalDetails, useSubmitVote, useAvailableVotes } from '../hooks';
import { voteCountFormatter } from '../utils';
import { Card } from './Card';

const RefundExplanationPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Icon as={FontAwesomeIcon} color="gray.100" cursor="pointer" icon={faInfoCircle} />
      </PopoverTrigger>
      <PopoverContent
        color="white"
        fontSize="16px"
        background="brand.500"
        _focus={{ boxShadow: 'none' }}
        _focusVisible={{ outline: 'none' }}
      >
        <PopoverHeader paddingTop="24px" fontWeight="bold" border="0">
          Instant Gas Refund
        </PopoverHeader>
        <PopoverArrow backgroundColor="brand.500" />
        <PopoverCloseButton />
        <PopoverBody paddingBottom="24px">
          <Text>
            The transaction gas you spend on this vote will be automatically refunded to you in the same transaction.
          </Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export type VotingCardProps = {
  proposal: ProposalDetails;
};

export const VotingCard = ({ proposal }: VotingCardProps) => {
  const { vote, refundAvailable } = useSubmitVote(proposal.governor.id, proposal.id);
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
    <Card flexDirection="column" gap="12px" display="flex" alignItems="center">
      <Box alignItems="center" justifyContent="space-around" display="flex" width="100%">
        <Stat>
          <StatLabel>For</StatLabel>
          <StatNumber>{votesFor}</StatNumber>
          <StatHelpText>votes</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Against</StatLabel>
          <StatNumber>{votesAgainst}</StatNumber>
          <StatHelpText>votes</StatHelpText>
        </Stat>
      </Box>
      <Box flexDirection="column" gap="12px" display="flex">
        <Text fontWeight="bold">Vote</Text>
        {availableVotesLoading ? (
          <Spinner />
        ) : votes.isZero() ? (
          <Text>You do not have any votes in this organization</Text>
        ) : !active ? (
          <Text>Voting not active</Text>
        ) : hasVoted ? (
          <Text>You already voted on this proposal</Text>
        ) : (
          <Box alignItems="center" gap="12px" display="flex">
            <Button onClick={voteFor}>
              <FontAwesomeIcon icon={faThumbsUp} />
            </Button>
            <Button onClick={voteAgainst}>
              <FontAwesomeIcon icon={faThumbsDown} />
            </Button>
          </Box>
        )}
        {refundAvailable && (
          <Text alignItems="center" gap="8px" display="flex" fontSize="14px">
            <FontAwesomeIcon icon={faCheckCircle} color="rgb(0,200,0)" /> Instant Gas Refund
            <RefundExplanationPopover />
          </Text>
        )}
      </Box>
    </Card>
  );
};
