import { Center, Heading, Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { faGasPump } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ethers } from 'ethers';

import { useRefundPools } from '../hooks/useRefundPools';
import { AvatarAndName } from './AvatarAndName';
import { Card } from './Card';
import { CreateGasRefundPoolButton } from './CreateGasRefundPoolButton';

export type GasRefundPoolsCardProps = {
  governorId: string;
};

export const GasRefundPoolsCard = ({ governorId }: GasRefundPoolsCardProps) => {
  const { refundPools, loading } = useRefundPools(governorId);

  let content = (
    <Center>
      <Spinner />
    </Center>
  );

  if (!loading) {
    content = (
      <TableContainer width="100%">
        <Table overflowX="hidden" size="sm" variant="unstyled">
          <Thead>
            <Tr>
              <Th>Funder</Th>
              <Th>Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            {refundPools.map(pool => (
              <Tr key={pool.id}>
                <Td>
                  <AvatarAndName size="16px" address={pool.owner.id} />
                </Td>
                <Td isNumeric>{ethers.utils.formatEther(pool.balance)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Card flexDirection="column" gap="12px" display="flex" alignItems="center">
      <Heading as="h4" gap="8px" display="flex" width="100%" size="md">
        <FontAwesomeIcon icon={faGasPump} /> Gas Refund Pools
      </Heading>
      <CreateGasRefundPoolButton governorId={governorId} />
      {content}
    </Card>
  );
};
