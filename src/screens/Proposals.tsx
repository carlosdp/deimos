import { Box, Heading } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { ProposalList } from '../components/ProposalList';

export const Proposals = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box width="100%" maxWidth="936px">
      <Heading paddingBottom="20px">Proposals</Heading>
      <ProposalList governorId={id!} />
    </Box>
  );
};
