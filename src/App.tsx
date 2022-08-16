import { Avatar, Box, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Routes, Route } from 'react-router-dom';

import avatar from './public/avatar.png';
import { Proposal } from './screens/Proposal';
import { Proposals } from './screens/Proposals';

function Home() {
  return <Box width="100%" maxWidth="936px"></Box>;
}

function App() {
  return (
    <Box alignItems="center" flexDirection="column" display="flex" width="100%" padding="36px">
      <Box justifyContent="center" display="flex" width="100%" paddingBottom="36px">
        <Box alignItems="center" flexDirection="row" display="flex" width="100%" maxWidth="936px">
          <Box alignItems="center" gap="12px" display="flex">
            <Avatar width="36px" height="36px" src={avatar} />
            <Box flexDirection="column" display="flex">
              <Text as="span" fontSize="18px" fontWeight="bold">
                Decisions
              </Text>
              <Text as="span" fontSize="8px">
                a carlosdp.eth project
              </Text>
            </Box>
          </Box>
          <Box marginLeft="auto">
            <ConnectButton showBalance={false} />
          </Box>
        </Box>
      </Box>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/governors/:id" element={<Proposals />} />
        <Route path="/governors/:governorId/proposals/:id" element={<Proposal />} />
      </Routes>
    </Box>
  );
}

export default App;
