import { Box, Center, Heading, Spinner } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { GasRefundPoolsCard } from '../components/GasRefundPoolsCard';
import { ProposalList } from '../components/ProposalList';
import { useGovernor } from '../hooks';

export const Proposals = () => {
  const { id } = useParams<{ id: string }>();
  const { governor, loading } = useGovernor(id!);
  const navigate = useNavigate();

  const goToProposal = useCallback(
    (proposalId: string) => {
      navigate(`/governors/${id}/proposals/${proposalId}`);
    },
    [navigate, id]
  );

  if (loading || !governor) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <Box flexWrap="wrap" gap="12px" display="flex" width="100%" maxWidth="936px">
      <Box flex={2} minWidth="500px">
        <Heading paddingBottom="20px">Proposals</Heading>
        <ProposalList governorId={governor.id} onClick={goToProposal} />
      </Box>
      <Box flex={1} minWidth="200px">
        <GasRefundPoolsCard governorId={governor.id} />
      </Box>
    </Box>
  );
};
