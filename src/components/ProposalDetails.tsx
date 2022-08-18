import { Box, Heading, Link, Text, Tab, TabList, TabPanels, Tabs, TabPanel } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

import { ProposalDetails as ProposalDetailsType } from '../hooks';
import { Card } from './Card';
import { ProposalInfoCard } from './ProposalInfoCard';
import { VotingCard } from './VotingCard';

export type ProposalDetailsProps = {
  proposal: ProposalDetailsType;
};

export function ProposalDetails({ proposal }: ProposalDetailsProps) {
  return (
    <Box flexWrap="wrap" flexDirection="row" gap="16px" display="flex">
      <Box flexDirection="column" flex="1" gap="18px" display="flex">
        <ProposalInfoCard createdAt={proposal.createdAt} proposer={proposal.proposer.id} />
        <VotingCard proposal={proposal} />
      </Box>
      <Box flexDirection="column" flex="3" display="flex" minWidth="500px">
        <Tabs colorScheme="brand" variant="soft-rounded">
          <TabList>
            <Tab>Full Text</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Card minHeight="500px">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <Heading as="h1" variant="md-h1">
                        {children}
                      </Heading>
                    ),
                    h2: ({ children }) => (
                      <Heading as="h2" variant="md-h2">
                        {children}
                      </Heading>
                    ),
                    h3: ({ children }) => (
                      <Heading as="h3" variant="md-h3">
                        {children}
                      </Heading>
                    ),
                    h4: ({ children }) => (
                      <Heading as="h4" variant="md-h4">
                        {children}
                      </Heading>
                    ),
                    h5: ({ children }) => (
                      <Heading as="h5" variant="md-h5">
                        {children}
                      </Heading>
                    ),
                    h6: ({ children }) => (
                      <Heading as="h6" variant="md-h6">
                        {children}
                      </Heading>
                    ),
                    p: ({ children }) => <Text variant="md-p">{children}</Text>,
                    a: ({ children, href }) => (
                      <Link href={href} target="_blank" variant="md-a">
                        {children}
                      </Link>
                    ),
                  }}
                >
                  {proposal.description}
                </ReactMarkdown>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
