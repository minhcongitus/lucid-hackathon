import { web3, Spl, utils, BN, AnchorProvider } from '@project-serum/anchor'

export const newToken = async (provider: AnchorProvider) => {
  const token = web3.Keypair.generate()
  await initializeMint(token, provider)
  await initAccountToken(token.publicKey, provider)
  await mintTo(new BN('10000000000000000'), token.publicKey, provider)
  return token.publicKey.toBase58()
}

export const initializeMint = async (
  token: web3.Keypair,
  provider: AnchorProvider,
) => {
  const splProgram = Spl.token(provider)
  const ix = await (splProgram.account as any).mint.createInstruction(token)
  const tx = new web3.Transaction().add(ix)
  await provider.sendAndConfirm(tx, [token])
  return await splProgram.rpc.initializeMint(
    9,
    provider.wallet.publicKey,
    provider.wallet.publicKey,
    {
      accounts: {
        mint: token.publicKey,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    },
  )
}

export const mintTo = async (
  amount: BN,
  mintPublicKey: web3.PublicKey,
  provider: AnchorProvider,
) => {
  const splProgram = Spl.token(provider)
  const associatedAddress = await utils.token.associatedAddress({
    mint: mintPublicKey,
    owner: provider.wallet.publicKey,
  })
  const txId = await splProgram.rpc.mintTo(amount, {
    accounts: {
      mint: mintPublicKey,
      to: associatedAddress,
      authority: provider.wallet.publicKey,
    },
    signers: [],
  })
  return { txId }
}

export const initAccountToken = async (
  token: web3.PublicKey,
  provider: AnchorProvider,
) => {
  const associatedTokenAccount = await utils.token.associatedAddress({
    mint: token,
    owner: provider.wallet.publicKey,
  })
  const ix = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: provider.wallet.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: associatedTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: provider.wallet.publicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: token,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: utils.token.TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: utils.token.ASSOCIATED_PROGRAM_ID,
    data: Buffer.from([]),
  })
  const tx = new web3.Transaction().add(ix)
  return await provider.sendAndConfirm(tx)
}
