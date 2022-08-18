export const useGovernor = (id: string) => {
  return {
    loading: false,
    governor: { id, ensName: 'ensdao.eth', displayName: 'ENS DAO' },
  };
};
