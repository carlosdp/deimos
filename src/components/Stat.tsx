import { Box, Text } from '@chakra-ui/react';

export type StatProps = {
  label?: string;
  figure: string;
  units?: string;
};

export const Stat = ({ label, figure, units }: StatProps) => {
  return (
    <Box flexDirection="column" display="flex">
      <Text as="span" color="grey" fontSize="14px">
        {label}
      </Text>
      <Text as="span" fontSize="24px" fontWeight="bold">
        {figure}
      </Text>
      <Text as="span" color="grey" fontSize="14px">
        {units}
      </Text>
    </Box>
  );
};
