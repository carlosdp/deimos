import { connectorsForWallets, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { chain, createClient, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

export const { chains, provider } = configureChains(
  [import.meta.env.DEV ? chain.hardhat : chain.mainnet],
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: 'Deimos',
  chains,
});

export const connectors = connectorsForWallets([
  {
    groupName: wallets[0].groupName,
    wallets: wallets[0].wallets.filter(w => w.id !== 'rainbow').sort(w => (w.id === 'metamask' ? -1 : 0)),
  },
]);

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
