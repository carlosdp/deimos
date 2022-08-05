/* eslint-disable unicorn/filename-case */
module.exports = {
  '**/*.{js,jsx,ts,tsx}': ['yarn fix --no-error-on-unmatched-pattern', () => 'tsc --noEmit'],
  'contracts/{src,test}/**/*.sol': [() => 'cd contracts && forge test --gas-price 10000000'],
};
