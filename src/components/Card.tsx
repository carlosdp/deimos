import { Box, BoxProps } from '@chakra-ui/react';

export const Card = (props: BoxProps) => {
  return <Box padding="20px" background="cardBackground" borderRadius="24px" {...props} />;
};
