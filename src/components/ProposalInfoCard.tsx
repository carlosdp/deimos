import { Box, Text } from '@chakra-ui/react';
import moment from 'moment';

import { AvatarAndName } from './AvatarAndName';
import { Card } from './Card';
import { Stat } from './Stat';

export type ProposalInfoCardProps = {
  createdAt: moment.Moment;
  proposer: string;
};

export const ProposalInfoCard = ({ createdAt, proposer }: ProposalInfoCardProps) => {
  return (
    <Card>
      <Stat label="Proposed on" figure={createdAt.format('MMMM DD, YYYY')} />
      <Box gap="6px" display="flex">
        <Text as="span">by</Text>
        <AvatarAndName address={proposer} size="16px" />
      </Box>
    </Card>
  );
};
