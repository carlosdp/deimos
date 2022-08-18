import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { ProposalDetails, useGovernor } from '../hooks';
import { extractProposalTitle } from '../utils';

export type ProposalBreadcrumbsProps = {
  proposal: ProposalDetails;
};

export const ProposalBreadcrumbs = ({ proposal }: ProposalBreadcrumbsProps) => {
  const { governor, loading } = useGovernor(proposal.governor.id);

  if (loading) {
    return null;
  }

  return (
    <Breadcrumb padding="20px">
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} to={`/governors/${proposal.governor.id}`}>
          {governor.displayName}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem fontWeight="bold" isCurrentPage>
        <BreadcrumbLink href="#">{extractProposalTitle(proposal)}</BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};
