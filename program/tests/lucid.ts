import { initAccountToken, initializeMint, mintTo } from './pretest/helper'
import * as anchor from '@project-serum/anchor'

import LucidProgram, { Lucid } from '../lib'
import { Keypair, PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'
import { Program } from '@project-serum/anchor'

describe('lucid', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const rawProgram = anchor.workspace.Lucid as Program<Lucid>
  const lucidProgram = new LucidProgram(provider, rawProgram.programId)

  let MINT: PublicKey
  let BASE_MINT: PublicKey
  let POOL: PublicKey

  // Configs
  const FEE = new BN(0_100_000_000) // 10%
  const AMOUNT = new BN(1000)
  const STABLE_AMOUNT = new BN(1000)
  const BURN_STABLE_AMOUNT = new BN(100)

  before('Is generate data!', async () => {
    const mint = Keypair.generate()
    await initializeMint(mint, provider)
    await initAccountToken(mint.publicKey, provider)
    await mintTo(new BN(10000000000), mint.publicKey, provider)
    MINT = mint.publicKey
    const baseMint = Keypair.generate()
    await initializeMint(baseMint, provider)
    await initAccountToken(baseMint.publicKey, provider)
    await mintTo(new BN(10000000000), baseMint.publicKey, provider)
    BASE_MINT = baseMint.publicKey
  })

  it('Is initialized!', async () => {
    const data = await lucidProgram.initializePool(
      MINT,
      BASE_MINT,
      FEE,
      AMOUNT,
      STABLE_AMOUNT,
      new BN(0),
    )
    POOL = data.address
  })

  it('Is mint to stable token!', async () => {
    await lucidProgram.mintStable(POOL, STABLE_AMOUNT.add(BURN_STABLE_AMOUNT))
  })

  it('Is burn stable token!', async () => {
    await lucidProgram.burnStable(POOL, BURN_STABLE_AMOUNT)
  })

  it('Is add liquidity!', async () => {
    await lucidProgram.addLiquidity(POOL, AMOUNT, STABLE_AMOUNT, new BN(0))
  })
  it('Is borrow!', async () => {
    await lucidProgram.borrow(POOL, new BN(10))
  })

  it('Is remove liquidity!', async () => {
    await lucidProgram.removeLiquidity(POOL, new BN(1900))
  })

  it('Is fetched pool data!', async () => {
    const poolData = await lucidProgram.program.account.pool.fetch(POOL)
    console.log('poolData', poolData)
    console.log('baseBalance', poolData.baseBalance.toString())
  })

  anchor.utils.features.set('debug-logs')
  it('test jupiter!', async () => {
    const { address } = await lucidProgram.initializeJupiter()
    console.log('Create OK')
    const jupiter = await lucidProgram.program.account.jupiter.fetch(address)
    console.log('jupiter', jupiter)

    const swap = await lucidProgram.swapJupiter(
      jupiter.baseMint,
      BASE_MINT,
      new BN(100),
      new BN(200),
    )
    console.log('SWAP JUPITER OK')
  })
})
