import { Box, Avatar, Text } from '@chakra-ui/react';
import { useEnsName, useEnsAvatar } from 'wagmi';

export type AvatarAndNameProps = {
  address: string;
  size: string;
};

export function AvatarAndName({ address, size }: AvatarAndNameProps) {
  const { data: name } = useEnsName({ address, chainId: 1 });
  const { data: avatar } = useEnsAvatar({ addressOrName: address, chainId: 1 });

  return (
    <Box alignItems="center" gap="0.2em" display="flex">
      <Avatar width={size} height={size} src={avatar ?? undefined} />
      <Text fontSize={size} fontWeight="normal">
        {name ?? `${address.slice(0, 4)}..${address.slice(-4)}`}
      </Text>
    </Box>
  );
}
