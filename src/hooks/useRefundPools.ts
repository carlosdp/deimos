import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const PROXY_SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/governor-proxy';

export type RefundPool = {
  id: string;
  owner: { id: string };
  balance: ethers.BigNumber;
  maxFeePerGas: ethers.BigNumber;
  maxPriorityFeePerGas: ethers.BigNumber;
};

export const useRefundPools = (governorId: string) => {
  const [refundPools, setRefundPools] = useState<RefundPool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const res = await fetch(PROXY_SUBGRAPH_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            query: `
            query GetRefundPools($governorId: String!) {
              refundPools(where: { governor: $governorId, balance_gt: 0 }, first: 25) {
                id
                owner {
                  id
                }
                balance
                maxFeePerGas
                maxPriorityFeePerGas
              }
            }
            `,
            variables: {
              governorId,
            },
          }),
        });

        if (!res.ok) {
          throw new Error('refund pool request failed');
        }

        const resData = await res.json();

        setRefundPools(
          resData.data.refundPools.map(
            (pool: {
              id: string;
              owner: { id: string };
              balance: string;
              maxFeePerGas: string;
              maxPriorityFeePerGas: string;
            }) => ({
              ...pool,
              balance: ethers.BigNumber.from(pool.balance),
              maxFeePerGas: ethers.BigNumber.from(pool.maxFeePerGas),
              maxPriorityFeePerGas: ethers.BigNumber.from(pool.maxPriorityFeePerGas),
            })
          )
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [governorId]);

  return { refundPools, loading };
};
