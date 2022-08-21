import { Box, Text, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import moment from 'moment';

import { AvatarAndName } from './AvatarAndName';
import { Card } from './Card';

export type ProposalInfoCardProps = {
  createdAt: moment.Moment;
  proposer: string;
};

export const ProposalInfoCard = ({ createdAt, proposer }: ProposalInfoCardProps) => {
  return (
    <Card>
      <Stat>
        <StatLabel>Proposed on</StatLabel>
        <StatNumber>{createdAt.format('MMMM DD, YYYY')}</StatNumber>
      </Stat>
      <Box gap="6px" display="flex">
        <Text as="span">by</Text>
        <AvatarAndName address={proposer} size="16px" />
      </Box>
    </Card>
  );
};
