import { ProposalDetails } from './hooks';

export const voteCountFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const extractProposalTitle = (proposal: ProposalDetails) => {
  return proposal.description;
};
