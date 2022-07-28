import { Box, Spinner } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

import { useProposal } from '../hooks';

export type ProposalDetailsProps = {
  id: string;
};

export function ProposalDetails({ id }: ProposalDetailsProps) {
  const { proposal, loading } = useProposal(id);

  if (loading || !proposal) {
    return <Spinner />;
  }

  return (
    <Box>
      <ReactMarkdown>{proposal.description}</ReactMarkdown>
    </Box>
  );
}
