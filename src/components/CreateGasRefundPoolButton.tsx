import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { faCheckCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount, useBalance, useSigner } from 'wagmi';

const GAS_REFUND_PROXY_ADDRESS = import.meta.env.VITE_GAS_REFUND_PROXY_ADDRESS;
const gasRefundProxyABI = [
  'function createPool(address governor,uint256 maxFeePerGas,uint256 maxPriorityFeePerGas) public payable',
];

type CreatePoolForm = {
  value: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
};

export type CreateGasRefundPoolButtonProps = {
  governorId: string;
};

export const CreateGasRefundPoolButton = ({ governorId }: CreateGasRefundPoolButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm<CreatePoolForm>({
    defaultValues: { value: 0.1, maxFeePerGas: 0, maxPriorityFeePerGas: 1 },
  });
  const { data: account } = useAccount();
  const { data } = useBalance({ addressOrName: account?.address, enabled: !account });
  const { data: signer } = useSigner();

  const openModal = useCallback(() => setModalOpen(true), []);

  const onClose = useCallback(() => {
    setModalOpen(false);
    reset();
    setCreated(false);
  }, [reset]);

  const createPool = useCallback(
    async (formData: CreatePoolForm) => {
      if (signer) {
        try {
          setCreating(true);
          const gasRefundProxy = new ethers.Contract(GAS_REFUND_PROXY_ADDRESS, gasRefundProxyABI, signer);

          await gasRefundProxy.createPool(
            governorId,
            ethers.utils.parseUnits(formData.maxFeePerGas.toString(), 'gwei'),
            ethers.utils.parseUnits(formData.maxPriorityFeePerGas.toString(), 'gwei'),
            {
              value: ethers.utils.parseEther(formData.value.toString()).toHexString(),
            }
          );

          setCreated(true);
        } finally {
          setCreating(false);
        }
      }
    },
    [signer, governorId]
  );

  const balance = data ? Number.parseFloat(data.formatted) : 0;

  let content = (
    <Box flexDirection="column" gap="16px" display="flex">
      <FormControl isInvalid={!!formState.errors.value}>
        <FormLabel>Amount</FormLabel>
        <NumberInput max={balance} min={0.01} step={0.1}>
          <NumberInputField {...register('value', { max: balance })} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormHelperText>Amount you would like to deposit into the pool, in ETH</FormHelperText>
        {formState.errors.value && <FormErrorMessage>{formState.errors.value.message}</FormErrorMessage>}
      </FormControl>
      <Accordion allowMultiple>
        <AccordionItem border="0">
          <AccordionButton>
            <Text>Advanced</Text> <AccordionIcon />
          </AccordionButton>
          <AccordionPanel flexDirection="column" gap="12px" display="flex">
            <FormControl>
              <FormLabel>Max Fee Per Gas</FormLabel>
              <NumberInput defaultValue={0} step={1}>
                <NumberInputField {...register('maxFeePerGas')} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>
                Max base fee per gas your pool will refund, in gwei. If zero, will accept any
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Max Priority Fee Per Gas</FormLabel>
              <NumberInput defaultValue={0} step={1}>
                <NumberInputField {...register('maxPriorityFeePerGas')} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>
                Max priority fee per gas your pool will refund, in gwei. If zero, will accept any
              </FormHelperText>
            </FormControl>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Button onClick={handleSubmit(createPool)}>Fund Pool</Button>
    </Box>
  );

  if (creating) {
    content = (
      <Center minHeight="150px">
        <Box alignItems="center" flexDirection="column" gap="12px" display="flex">
          <Text>Confirm the transaction in your wallet</Text>
          <Spinner />
        </Box>
      </Center>
    );
  }

  if (created) {
    content = (
      <Center minHeight="150px">
        <Box alignItems="center" flexDirection="column" gap="12px" display="flex">
          <FontAwesomeIcon icon={faCheckCircle} color="green" fontSize="52px" />
          <Text fontWeight="bold">You've funded a gas refund pool!</Text>
          <Text>Members of this organization can now vote gas-free using your funds.</Text>
          <Button onClick={onClose}>Done</Button>
        </Box>
      </Center>
    );
  }

  return (
    <>
      <Button leftIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openModal}>
        Fund New Pool
      </Button>
      <Modal isOpen={modalOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Gas Refund Pool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{content}</ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
