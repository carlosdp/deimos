import { Box, Spinner } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { ProposalDetails } from '../components/ProposalDetails';
import { useProposal } from '../hooks';

export function Proposal() {
  const { id } = useParams<{ id: string }>();
  const { proposal, loading } = useProposal(id!);

  if (loading || !proposal) {
    return <Spinner />;
  }

  return (
    <Box maxWidth="936px">
      <ProposalDetails proposal={proposal} />
    </Box>
  );
}
