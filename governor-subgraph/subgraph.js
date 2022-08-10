module.exports = {
  specVersion: '0.0.4',
  schema: {
    file: './schema.graphql',
  },
  dataSources: [
    {
      kind: 'ethereum',
      name: 'Governor',
      network: 'mainnet',
      source: {
        address: process.env.GOVERNOR_ADDRESS ?? '0x323A76393544d5ecca80cd6ef2A560C6a395b7E3',
        abi: 'Governor',
        startBlock: process.env.GOVERNOR_START_BLOCK ? Number.parseInt(process.env.GOVERNOR_START_BLOCK) : 13_533_772,
      },
      mapping: {
        kind: 'ethereum/events',
        apiVersion: '0.0.6',
        language: 'wasm/assemblyscript',
        entities: ['Account', 'Proposal', 'Vote', 'ProposalEvent', 'QuorumNumeratorUpdated', 'TimelockChange'],
        abis: [
          {
            name: 'Governor',
            file: './abis/Governor.json',
          },
        ],
        eventHandlers: [
          {
            event: 'ProposalCanceled(uint256)',
            handler: 'handleProposalCanceled',
          },
          {
            event: 'ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)',
            handler: 'handleProposalCreated',
          },
          {
            event: 'ProposalExecuted(uint256)',
            handler: 'handleProposalExecuted',
          },
          {
            event: 'ProposalQueued(uint256,uint256)',
            handler: 'handleProposalQueued',
          },
          {
            event: 'QuorumNumeratorUpdated(uint256,uint256)',
            handler: 'handleQuorumNumeratorUpdated',
          },
          {
            event: 'TimelockChange(address,address)',
            handler: 'handleTimelockChange',
          },
          {
            event: 'VoteCast(indexed address,uint256,uint8,uint256,string)',
            handler: 'handleVoteCast',
          },
        ],
        file: './src/governor.ts',
      },
    },
  ],
};
