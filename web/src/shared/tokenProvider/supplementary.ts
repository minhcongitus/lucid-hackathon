// Pseudo native sol info
// It's for all networks
export const sol = (chainId: 101 | 102 | 103) => ({
  symbol: 'SOL',
  name: 'Solana',
  address: '11111111111111111111111111111111',
  decimals: 9,
  chainId,
  extensions: {
    coingeckoId: 'solana',
  },
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
})

// Pseudo SNTR info
// Only for devnet and testnet
export const sntr = (chainId: 102 | 103) => ({
  symbol: 'SNTR',
  name: 'Sentre',
  address: '5YwUkPdXLoujGkZuo9B4LsLKj3hdkDcfP4derpspifSJ',
  decimals: 9,
  chainId,
  extensions: {
    coingeckoId: 'sentre',
  },
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M/logo.png',
})

// Pseudo token infos for devnet
const supplementary = [
  sol(103),
  sntr(103),
  {
    symbol: 'LUCID',
    name: 'Lucid Protocol',
    address: 'KXtP4RtYWJimgFo55eMqSS848WM3naSpGKCK2SSrhKq',
    decimals: 9,
    chainId: 103,
    extensions: {
      coingeckoId: 'kitty-solana',
    },
    logoURI: 'https://cdn.jsdelivr.net/gh/xRoBBeRT/DickButtLogo/DickButt.png',
  },
  {
    symbol: 'wBTC',
    name: 'Wrapped Bitcoin',
    address: '7dH1RdQ7T3fihkEFBywAvj4otHVThF3tcQsgcM7rRTWi',
    decimals: 9,
    chainId: 103,
    extensions: {
      coingeckoId: 'bitcoin',
    },
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
  },
  {
    symbol: 'wETH',
    name: 'Ethereum',
    address: '6PZYZ94K3yo4QdohYwa9RFVxtw8qFcFQqMtBjakn27BX',
    decimals: 9,
    chainId: 103,
    extensions: {
      coingeckoId: 'ethereum',
    },
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/FeGn77dhg1KXRRFeSwwMiykZnZPw5JXW6naf2aQgZDQf/logo.png',
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '4yB7HvKcpfAP4TVg4KnWAgmM9fRWAYWev17QM91bkQ3W',
    decimals: 9,
    chainId: 103,
    extensions: {
      coingeckoId: 'uniswap',
    },
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3MVa4e32PaKmPxYUQ6n8vFkWtCma68Ld7e7fTktWDueQ/logo.png',
  },
  {
    chainId: 103,
    address: 'Cz7YwKixHdwEcBnT4QDFWUHvjpQV19ZEJzwqKH4vVhfp',
    symbol: 'SRM',
    name: 'Serum',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png',
    extensions: {
      coingeckoId: 'serum',
    },
  },
  {
    chainId: 103,
    address: 'BnVME3KEuE4Nw8mhhfpz353rw4AFVUYgvutfuLJx78AZ',
    symbol: 'LUGEM',
    name: 'Lucid GEM',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2YJH1Y5NbdwJGEUAMY6hoTycKWrRCP6kLKs62xiSKWHM/logo.png',
    extensions: {
      coingeckoId: 'serum',
    },
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '86RG7SrLu1dtuE2Eyg3XqWjEdpUwNUM7hsbMS5MVmv66',
    decimals: 9,
    chainId: 103,
    extensions: {
      coingeckoId: 'usd-coin',
    },
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
]

export default supplementary
