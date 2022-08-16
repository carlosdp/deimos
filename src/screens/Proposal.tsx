import { Box, Spinner } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { ProposalDetails } from '../components/ProposalDetails';
import { useProposal } from '../hooks';

export function Proposal() {
  const { governorId, id } = useParams<{ governorId: string; id: string }>();
  const { proposal, loading } = useProposal(`${governorId}:${id}`);

  if (loading || !proposal) {
    return <Spinner />;
  }

  return (
    <Box width="100%" maxWidth="936px">
      <ProposalDetails proposal={proposal} />
    </Box>
  );
}
