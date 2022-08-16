import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const PROXY_SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/governor-proxy';

export type RefundPool = {
  id: string;
  balance: ethers.BigNumber;
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
                balance
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
          resData.data.refundPools.map((pool: { id: string; balance: string }) => ({
            id: pool.id,
            balance: ethers.BigNumber.from(pool.balance),
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [governorId]);

  return { refundPools, loading };
};
