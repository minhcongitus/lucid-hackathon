import {
  Address,
  Program,
  utils,
  web3,
  AnchorProvider,
  IdlAccounts,
  BN,
} from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token'
import { ComputeBudgetProgram, Transaction } from '@solana/web3.js'
import { PoolsState } from 'app/model/pools.controller'

import { DEFAULT_IDL } from './constant'
import { Lucid } from './lucid'
import { isAddress } from './utils'

export type PoolData = IdlAccounts<Lucid>['pool']

const DEFAULT_PROGRAMS = {
  rent: web3.SYSVAR_RENT_PUBKEY,
  systemProgram: web3.SystemProgram.programId,
  associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
  tokenProgram: TOKEN_PROGRAM_ID,
}

export type BalancerAccountChangeInfo = {
  type: 'pool'
  address: string
  data: Buffer
}

class LucidProgram {
  private _provider: AnchorProvider
  readonly program: Program<Lucid>

  constructor(provider: AnchorProvider, programId: Address) {
    if (!isAddress(programId)) throw new Error('Invalid program id')
    // Private
    this._provider = provider
    // Public
    this.program = new Program<Lucid>(DEFAULT_IDL, programId, this._provider)
  }

  getPools = async (): Promise<PoolsState> => {
    let accounts = await this.program.account.pool.all()
    accounts = accounts.sort(
      (a, b) =>
        b.account.totalLptFee.toNumber() - a.account.totalLptFee.toNumber(),
    )
    const pools: PoolsState = {}
    for (const account of accounts) {
      pools[account.publicKey.toBase58()] = account.account
    }
    return pools
  }

  getPoolPDAs = async (pool: Address, mint: Address, baseMint: Address) => {
    const poolPublicKey = new web3.PublicKey(pool)
    const mintPublicKey = new web3.PublicKey(mint)
    const baseMintPublicKey = new web3.PublicKey(baseMint)
    const [treasurer] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('treasurer'), poolPublicKey.toBuffer()],
      this.program.programId,
    )
    const [stableMint] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('stable_mint'), poolPublicKey.toBuffer()],
      this.program.programId,
    )
    const [lptMint] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('lpt_mint'), poolPublicKey.toBuffer()],
      this.program.programId,
    )

    const treasury = await utils.token.associatedAddress({
      mint: mintPublicKey,
      owner: treasurer,
    })
    const stableTreasury = await utils.token.associatedAddress({
      mint: stableMint,
      owner: treasurer,
    })
    const baseTreasury = await utils.token.associatedAddress({
      mint: baseMintPublicKey,
      owner: treasurer,
    })
    const lptTreasury = await utils.token.associatedAddress({
      mint: lptMint,
      owner: treasurer,
    })
    return {
      pool,
      treasurer,
      mint,
      stableMint,
      baseMint,
      lptMint,
      treasury,
      stableTreasury,
      baseTreasury,
      lptTreasury,
    }
  }

  getTokenAccounts = async (
    authority: Address,
    pool: Address,
    mint: Address,
    baseMint: Address,
  ) => {
    const walletPublicKey = new web3.PublicKey(authority)
    const mintPublicKey = new web3.PublicKey(mint)
    const baseMintPublicKey = new web3.PublicKey(baseMint)
    const poolPDAs = await this.getPoolPDAs(pool, mint, baseMint)

    const tokenAccount = await utils.token.associatedAddress({
      mint: mintPublicKey,
      owner: walletPublicKey,
    })
    const baseTokenAccount = await utils.token.associatedAddress({
      mint: baseMintPublicKey,
      owner: walletPublicKey,
    })
    const stableTokenAccount = await utils.token.associatedAddress({
      mint: poolPDAs.stableMint,
      owner: walletPublicKey,
    })
    const lptTokenAccount = await utils.token.associatedAddress({
      mint: poolPDAs.lptMint,
      owner: walletPublicKey,
    })
    const [cheque] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from('cheque'),
        new web3.PublicKey(pool).toBuffer(),
        walletPublicKey.toBuffer(),
      ],
      this.program.programId,
    )
    const [cert] = await web3.PublicKey.findProgramAddress(
      [poolPDAs.lptMint.toBuffer(), walletPublicKey.toBuffer()],
      this.program.programId,
    )
    return {
      cert,
      cheque,
      lptTokenAccount,
      tokenAccount,
      stableTokenAccount,
      baseTokenAccount,
    }
  }

  initializePool = async (
    mint: Address,
    baseMint: Address,
    fee: BN,
    amount: BN,
    stableAmount: BN,
    baseAmount: BN,
  ) => {
    const pool = web3.Keypair.generate()
    const PDAs = await this.getPoolPDAs(pool.publicKey, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool.publicKey,
      mint,
      baseMint,
    )

    const additionalComputeBudgetInstruction =
      ComputeBudgetProgram.requestUnits({
        units: 400000,
        additionalFee: 0,
      })
    const transaction = new Transaction().add(
      additionalComputeBudgetInstruction,
    )

    const instruction = await this.program.methods
      .initializePool(fee, amount, stableAmount, baseAmount)
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .instruction()
    transaction.add(instruction)
    const txId = await this._provider.sendAndConfirm(transaction, [pool])
    return { txId, address: pool.publicKey }
  }

  mintStable = async (pool: Address, amount: BN) => {
    const { mint, baseMint } = await this.program.account.pool.fetch(pool)
    const PDAs = await this.getPoolPDAs(pool, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool,
      mint,
      baseMint,
    )
    const txId = await this.program.methods
      .mintStable(amount)
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .rpc()
    return { txId }
  }

  burnStable = async (pool: Address, amount: BN) => {
    const { mint, baseMint } = await this.program.account.pool.fetch(pool)
    const PDAs = await this.getPoolPDAs(pool, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool,
      mint,
      baseMint,
    )
    const txId = await this.program.methods
      .burnStable(amount)
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .rpc()
    return { txId }
  }

  addLiquidity = async (
    pool: Address,
    amount: BN,
    stableAmount: BN,
    baseAmount: BN,
  ) => {
    const { mint, baseMint } = await this.program.account.pool.fetch(pool)
    const PDAs = await this.getPoolPDAs(pool, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool,
      mint,
      baseMint,
    )
    const txId = await this.program.methods
      .addLiquidity(amount, stableAmount, baseAmount)
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .rpc()
    return { txId }
  }

  removeLiquidity = async (pool: Address, lpt_amount: BN) => {
    const { mint, baseMint } = await this.program.account.pool.fetch(pool)
    const PDAs = await this.getPoolPDAs(pool, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool,
      mint,
      baseMint,
    )
    const txId = await this.program.methods
      .removeLiquidity(lpt_amount)
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .rpc()
    return { txId }
  }

  borrow = async (pool: Address, lpt_amount: BN) => {
    const { mint, baseMint } = await this.program.account.pool.fetch(pool)
    const PDAs = await this.getPoolPDAs(pool, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool,
      mint,
      baseMint,
    )
    const txId = await this.program.methods
      .borrow(lpt_amount)
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .rpc()
    return { txId }
  }

  repay = async (pool: Address) => {
    const { mint, baseMint } = await this.program.account.pool.fetch(pool)
    const PDAs = await this.getPoolPDAs(pool, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool,
      mint,
      baseMint,
    )
    const txId = await this.program.methods
      .repay()
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .rpc()
    return { txId }
  }

  buy = async (pool: Address, stable_amount: BN, base_amount: BN) => {
    const { mint, baseMint } = await this.program.account.pool.fetch(pool)
    const PDAs = await this.getPoolPDAs(pool, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool,
      mint,
      baseMint,
    )
    const txId = await this.program.methods
      .buy(stable_amount, base_amount)
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .rpc()
    return { txId }
  }

  sell = async (pool: Address, amount: BN) => {
    const { mint, baseMint } = await this.program.account.pool.fetch(pool)
    const PDAs = await this.getPoolPDAs(pool, mint, baseMint)
    const wallet = this._provider.wallet
    const tokenAccounts = await this.getTokenAccounts(
      wallet.publicKey,
      pool,
      mint,
      baseMint,
    )
    const txId = await this.program.methods
      .sell(amount)
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...tokenAccounts,
        ...DEFAULT_PROGRAMS,
      })
      .rpc()
    return { txId }
  }

  /**
   * Watch account changes
   * @param callback
   * @param filters
   * @returns Watch id
   */
  watch = (
    callback: (
      error: string | null,
      data:
        | (Omit<BalancerAccountChangeInfo, 'data'> & {
            data: PoolData
          })
        | null,
    ) => void,
    filters?: web3.GetProgramAccountsFilter[],
  ): number => {
    const cb = ({
      accountId,
      accountInfo: { data: buf },
    }: web3.KeyedAccountInfo) => {
      const address = accountId.toBase58()
      try {
        const data = this.program.coder.accounts.decode('pool', buf)
        return callback(null, {
          type: 'pool',
          address,
          data,
        })
      } catch (error) {}
    }
    return this.program.provider.connection.onProgramAccountChange(
      this.program.programId,
      cb,
      'confirmed',
      filters,
    )
  }

  /**
   * Unwatch a watcher by watch id
   * @param watchId
   * @returns
   */
  unwatch = async (watchId: number): Promise<void> => {
    if (!watchId) return
    return await this.program.provider.connection.removeProgramAccountChangeListener(
      watchId,
    )
  }

  getAllJupiter = async () => {
    return this.program.account.jupiter.all()
  }

  getJupiterPDAs = async (
    jupiter: Address,
    mint: Address = web3.Keypair.generate().publicKey,
  ) => {
    const jupiterPublicKey = new web3.PublicKey(jupiter)
    let mintPublicKey: web3.PublicKey | undefined = undefined
    let mintTreasury: web3.PublicKey | undefined = undefined

    const [treasurer] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('treasurer'), jupiterPublicKey.toBuffer()],
      this.program.programId,
    )
    const [baseMint] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('base_mint'), jupiterPublicKey.toBuffer()],
      this.program.programId,
    )

    if (mint) {
      mintPublicKey = new web3.PublicKey(mint)
      mintTreasury = await utils.token.associatedAddress({
        mint: mintPublicKey,
        owner: treasurer,
      })
    }

    return {
      jupiter: jupiterPublicKey,
      treasurer,
      mint: mintPublicKey,
      mintTreasury,
      baseMint,
    }
  }

  getTokenAccountsJupiter = async (
    authority: Address,
    mint: Address,
    baseMint: Address,
  ) => {
    const walletPublicKey = new web3.PublicKey(authority)
    const mintPublicKey = new web3.PublicKey(mint)
    const baseMintPublicKey = new web3.PublicKey(baseMint)

    const tokenAccount = await utils.token.associatedAddress({
      mint: mintPublicKey,
      owner: walletPublicKey,
    })
    const baseTokenAccount = await utils.token.associatedAddress({
      mint: baseMintPublicKey,
      owner: walletPublicKey,
    })

    return {
      tokenAccount,
      baseTokenAccount,
    }
  }

  initializeJupiter = async () => {
    const jupiter = web3.Keypair.generate()
    const wallet = this._provider.wallet
    const PDAs = await this.getJupiterPDAs(jupiter.publicKey)
    const txId = await this.program.methods
      .initializeJupiter()
      .accounts({
        authority: wallet.publicKey,
        ...PDAs,
        ...DEFAULT_PROGRAMS,
      })
      .signers([jupiter])
      .rpc()
    return { txId, address: jupiter.publicKey }
  }

  swapJupiter = async (
    baseMint: Address,
    mint: Address,
    amountIn: BN,
    amountOut: BN,
  ) => {
    const listJupiter = await this.getAllJupiter()
    const wallet = this._provider.wallet
    for (const jupiter of listJupiter) {
      if (jupiter.account.baseMint.toBase58() !== baseMint.toString()) continue

      const PDAs = await this.getJupiterPDAs(jupiter.publicKey, mint)
      const tokenAccounts = await this.getTokenAccountsJupiter(
        wallet.publicKey,
        mint,
        jupiter.account.baseMint,
      )

      return this.program.methods
        .swapJupiter(amountIn, amountOut)
        .accounts({
          authority: wallet.publicKey,
          ...PDAs,
          ...tokenAccounts,
          ...DEFAULT_PROGRAMS,
        })
        .rpc()
    }
    return null
  }
}

export * from './constant'
export * from './utils'
export default LucidProgram
