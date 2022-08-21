import { ethers } from 'ethers';
import { useCallback } from 'react';
import { useSigner } from 'wagmi';

import { useAsyncMemo } from './useAsyncMemo';
import { useRefundPools } from './useRefundPools';

const DEFAULT_CHAIN_ID = process.env.NODE_ENV === 'development' ? 31_337 : 1;

const ballot = [
  { name: 'proposalId', type: 'uint256' },
  { name: 'support', type: 'uint8' },
];

const types = {
  Ballot: ballot,
};

const governorProxyAddress =
  process.env.NODE_ENV === 'development'
    ? '0xfd3bc22cb0889db8eff357e41908c46a088f3805'
    : '0xfc58f965d70fe42077e157079020e8e388d31ab5';

const governorABI = [
  'function name() public view returns (string memory)',
  'function version() public view returns (string memory)',
  'function state(uint256 proposalId) public view returns (uint8)',
  'function castVote(uint256 proposalId, uint8 support)',
  'function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s)',
];

const governorProxyABI = [
  'function castVoteBySig(address governor, uint256 poolId, uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s)',
];

const estimateGasForRefundedVote = async (provider: ethers.Signer) => {
  const REFUND_GAS_ESTIMATE = 168_000;
  const gasPrice = await provider.getGasPrice();

  return gasPrice.mul(REFUND_GAS_ESTIMATE);
};

export const useSubmitVote = (contractId: string, proposalId: string, chainId = DEFAULT_CHAIN_ID) => {
  const { data: signer } = useSigner();
  const { refundPools, loading: refundPoolsLoading } = useRefundPools(contractId);
  // todo: make actually robust
  const viableRefundPool = useAsyncMemo(async () => {
    if (signer) {
      const gasPrice = await signer.getGasPrice();
      const estimatedCost = await estimateGasForRefundedVote(signer);
      const viablePools = refundPools
        .filter(pool => pool.balance.gte(estimatedCost))
        .filter(pool => pool.maxFeePerGas.isZero() || pool.maxFeePerGas.gte(gasPrice))
        .sort(_ => (Math.random() < 0.5 ? -1 : 1));

      return viablePools[0] ?? null;
    } else {
      return null;
    }
  }, [refundPools, signer]);

  const vote = useCallback(
    async (support: number) => {
      if (signer) {
        const governor = new ethers.Contract(contractId, governorABI, signer);

        const proposalState = await governor.state(proposalId);

        if (proposalState !== 1) {
          throw new Error('proposal is not active');
        }

        if (viableRefundPool) {
          const domain = {
            name: await governor.name(),
            version: await governor.version(),
            chainId,
            verifyingContract: contractId,
          };

          // @ts-ignore
          const signature = await ethersSigner._signTypedData(domain, types, { proposalId, support });
          const r = '0x' + signature.slice(2, 66);
          const s = '0x' + signature.slice(66, 130);
          const v = Number.parseInt(signature.slice(130, 132), 16);

          const governorProxy = new ethers.Contract(governorProxyAddress, governorProxyABI, signer);

          await governorProxy.castVoteBySig(contractId, viableRefundPool.id, proposalId, support, v, r, s);
        } else {
          await governor.castVoteBySig(proposalId, support);
        }
      }
    },
    [signer, contractId, proposalId, chainId, viableRefundPool]
  );

  return { vote, refundAvailable: !!viableRefundPool, loading: refundPoolsLoading };
};
