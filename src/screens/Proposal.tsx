import { useParams } from 'react-router-dom';

import { ProposalDetails } from '../components/ProposalDetails';

export function Proposal() {
  const { id } = useParams<{ id: string }>();

  return <ProposalDetails id={id} />;
}
