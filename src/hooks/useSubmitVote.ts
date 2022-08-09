import { ethers } from 'ethers';
import { useCallback } from 'react';
import { useSigner } from 'wagmi';

const ballot = [
  { name: 'proposalId', type: 'uint256' },
  { name: 'support', type: 'uint8' },
];

const types = {
  Ballot: ballot,
};

const governorProxyAddress = '0xfc58f965d70fe42077e157079020e8e388d31ab5';

const governorABI = [
  'function name() public view returns (string memory)',
  'function version() public view returns (string memory)',
  'function state(uint256 proposalId) public view returns (uint8)',
  'function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s)',
];

const governorProxyABI = [
  'function castVoteBySig(address governor, uint256 poolId, uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s)',
];

export const useSubmitVote = (contractId: string, proposalId: string, chainId = 31_337) => {
  const { data: signer } = useSigner();

  const vote = useCallback(
    async (support: number) => {
      if (signer) {
        const governor = new ethers.Contract(contractId, governorABI, signer);

        const proposalState = await governor.state(proposalId);

        if (proposalState !== 1) {
          throw new Error('proposal is not active');
        }

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

        await governorProxy.castVoteBySig(contractId, 1 /* REPLACE */, proposalId, support, v, r, s);
      }
    },
    [signer, contractId, proposalId, chainId]
  );

  return { vote };
};
