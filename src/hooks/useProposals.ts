import { ethers } from 'ethers';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';

import Multicall from './Multicall.json';

const GOVERNOR_SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/governor';
const governorABI = ['function state(uint256 proposalId) public view returns (uint8)'];
const multicallAddress = import.meta.env.DEV
  ? '0x0165878a594ca255338adfa4d48449f69242eb8f'
  : '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';

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

const proposalStatuses = [
  'PENDING',
  'ACTIVE',
  'CANCELED',
  'DEFEATED',
  'SUCCEEDED',
  'QUEUED',
  'EXPIRED',
  'EXECUTED',
] as const;

export type ProposalStatus = typeof proposalStatuses[number];

const uintToProposalStatus = (n: number): ProposalStatus => {
  if (n < 0 || n > proposalStatuses.length) {
    throw new Error(`invalid proposal status: ${n}`);
  }

  return proposalStatuses[n];
};

export type Proposal = {
  id: string;
  proposalId: ethers.BigNumber;
  description: string;
  proposer: { id: string };
  status: ProposalStatus;
  createdAt: moment.Moment;
};

export function useProposals(governorId: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const provider = useProvider();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await querySubgraph(
          `
          query GetProposals($governorId: String!) {
            proposals(where: { governor: $governorId }, first: 100, orderBy: startBlock, orderDirection: desc) {
              id
              proposalId
              description
              proposer {
                id
              }
              createdAt
            }
          }
        `,
          { governorId }
        );

        const body = await res.json();
        const retrievedProposals = body.data.proposals;

        const multicall = new ethers.Contract(multicallAddress, Multicall.abi, provider);
        const governorInterface = new ethers.utils.Interface(governorABI);

        const calls = retrievedProposals.map((proposal: Proposal) => ({
          target: governorId,
          callData: governorInterface.encodeFunctionData('state', [proposal.proposalId]),
        }));

        const multicallResult = await multicall.aggregate(calls);

        const functionResults = multicallResult[1];

        const hydratedProposals = retrievedProposals.map((proposal: Proposal, i: number) => ({
          ...proposal,
          proposalId: ethers.BigNumber.from(proposal.proposalId),
          // @ts-ignore
          // note(carlos): just to reduce code, so we don't need to make another type
          createdAt: moment.unix(Number.parseInt(proposal.createdAt)),
          status: uintToProposalStatus(governorInterface.decodeFunctionResult('state', functionResults[i])[0]),
        }));

        setProposals(hydratedProposals);
      } finally {
        setLoading(false);
      }
    })();
  }, [provider, governorId]);

  return { proposals, loading };
}
