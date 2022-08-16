import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAsyncMemo = <T>(fn: () => Promise<T>, dependencies: any[]): T | null => {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    fn().then(setValue).catch(console.error);
  }, [fn, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return value;
};
