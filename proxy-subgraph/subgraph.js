module.exports = {
  specVersion: '0.0.4',
  schema: {
    file: './schema.graphql',
  },
  dataSources: [
    {
      kind: 'ethereum',
      name: 'GovernorGasRefundProxy',
      network: 'mainnet',
      source: {
        address: process.env.GOVERNOR_PROXY_ADDRESS,
        abi: 'GovernorGasRefundProxy',
        startBlock: process.env.GOVERNOR_PROXY_START_BLOCK
          ? Number.parseInt(process.env.GOVERNOR_PROXY_START_BLOCK)
          : 13_533_772,
      },
      mapping: {
        kind: 'ethereum/events',
        apiVersion: '0.0.6',
        language: 'wasm/assemblyscript',
        entities: ['Account', 'Governor', 'Proposal', 'RefundPool', 'Refund'],
        abis: [
          {
            name: 'GovernorGasRefundProxy',
            file: './abis/GovernorGasRefundProxy.json',
          },
        ],
        eventHandlers: [
          {
            event: 'RefundPoolCreated(indexed address,indexed uint256,indexed address,uint256)',
            handler: 'handleRefundPoolCreated',
          },
          {
            event: 'RefundPoolBalanceAdded(indexed address,indexed uint256,uint256)',
            handler: 'handleRefundPoolBalanceAdded',
          },
          {
            event: 'RefundPoolClosed(indexed address,indexed uint256)',
            handler: 'handleRefundPoolClosed',
          },
          {
            event: 'GasRefunded(indexed address,indexed uint256,indexed address,uint256,uint256)',
            handler: 'handleGasRefunded',
          },
        ],
        file: './src/governorProxy.ts',
      },
    },
  ],
};
