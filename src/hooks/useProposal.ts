import moment from 'moment';
import { useEffect, useState } from 'react';

import { ProposalStatus } from './useProposals';

const GOVERNOR_SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/governor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const querySubgraph = (query: string, variables: Record<string, any>) => {
  return fetch(GOVERNOR_SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
};

export type ProposalDetails = {
  id: string;
  governor: { id: string };
  proposalId: string;
  description: string;
  proposer: { id: string };
  status: ProposalStatus;
  createdAt: moment.Moment;
  votesForCount: string;
  votesAgainstCount: string;
};

export function useProposal(id: string) {
  const [proposal, setProposal] = useState<ProposalDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await querySubgraph(
          `
          query GetProposal($id: String!) {
            proposal(id: $id) {
              id
              governor {
                id
              }
              description
              proposer {
                id
              }
              proposalId
              status
              createdAt
              votesForCount
              votesAgainstCount
            }
          }
        `,
          { id }
        );

        const body = await res.json();
        const newProposal = body.data.proposal;

        setProposal(
          newProposal ? { ...newProposal, createdAt: moment.unix(Number.parseInt(newProposal.createdAt)) } : null
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { proposal, loading };
}
