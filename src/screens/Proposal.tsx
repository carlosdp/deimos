import { Box, Spinner } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { ProposalBreadcrumbs } from '../components/ProposalBreadcrumbs';
import { ProposalDetails } from '../components/ProposalDetails';
import { useGovernor, useProposal } from '../hooks';

export function Proposal() {
  const { governorId, id } = useParams<{ governorId: string; id: string }>();
  const { governor } = useGovernor(governorId!);
  const { proposal, loading } = useProposal(`${governor?.id}:${id}`);

  if (loading || !proposal) {
    return <Spinner />;
  }

  return (
    <Box width="100%" maxWidth="936px">
      <ProposalBreadcrumbs proposal={proposal} />
      <ProposalDetails proposal={proposal} />
    </Box>
  );
}
