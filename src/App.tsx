import { Box, Heading, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Routes, Route } from 'react-router-dom';

import { ProposalList } from './components/ProposalList';
import { Proposal } from './screens/Proposal';

function Home() {
  return (
    <Box width="100%" maxWidth="936px">
      <Heading paddingBottom="20px">Proposals</Heading>
      <ProposalList />
    </Box>
  );
}

function App() {
  return (
    <Box alignItems="center" flexDirection="column" display="flex" width="100%">
      <Box justifyContent="center" display="flex" width="100%" paddingTop="36px" paddingBottom="36px">
        <Box alignItems="center" flexDirection="row" display="flex" width="100%" maxWidth="936px">
          <Text>Web3 Starter</Text>
          <Box marginLeft="auto">
            <ConnectButton showBalance={false} />
          </Box>
        </Box>
      </Box>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/proposals/:id" element={<Proposal />} />
      </Routes>
    </Box>
  );
}

export default App;
