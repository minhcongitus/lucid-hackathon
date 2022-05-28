"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@project-serum/anchor");
const token_1 = require("@project-serum/anchor/dist/cjs/utils/token");
const web3_js_1 = require("@solana/web3.js");
const constant_1 = require("./constant");
const utils_1 = require("./utils");
const DEFAULT_PROGRAMS = {
    rent: anchor_1.web3.SYSVAR_RENT_PUBKEY,
    systemProgram: anchor_1.web3.SystemProgram.programId,
    associatedTokenProgram: anchor_1.utils.token.ASSOCIATED_PROGRAM_ID,
    tokenProgram: token_1.TOKEN_PROGRAM_ID,
};
class LucidProgram {
    constructor(provider, programId) {
        this.getPoolPDAs = (pool, mint, baseMint) => __awaiter(this, void 0, void 0, function* () {
            const poolPublicKey = new anchor_1.web3.PublicKey(pool);
            const mintPublicKey = new anchor_1.web3.PublicKey(mint);
            const baseMintPublicKey = new anchor_1.web3.PublicKey(baseMint);
            const [treasurer] = yield anchor_1.web3.PublicKey.findProgramAddress([Buffer.from('treasurer'), poolPublicKey.toBuffer()], this.program.programId);
            const [stableMint] = yield anchor_1.web3.PublicKey.findProgramAddress([Buffer.from('stable_mint'), poolPublicKey.toBuffer()], this.program.programId);
            const [lptMint] = yield anchor_1.web3.PublicKey.findProgramAddress([Buffer.from('lpt_mint'), poolPublicKey.toBuffer()], this.program.programId);
            const treasury = yield anchor_1.utils.token.associatedAddress({
                mint: mintPublicKey,
                owner: treasurer,
            });
            const stableTreasury = yield anchor_1.utils.token.associatedAddress({
                mint: stableMint,
                owner: treasurer,
            });
            const baseTreasury = yield anchor_1.utils.token.associatedAddress({
                mint: baseMintPublicKey,
                owner: treasurer,
            });
            const lptTreasury = yield anchor_1.utils.token.associatedAddress({
                mint: lptMint,
                owner: treasurer,
            });
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
            };
        });
        this.getTokenAccounts = (authority, pool, mint, baseMint) => __awaiter(this, void 0, void 0, function* () {
            const walletPublicKey = new anchor_1.web3.PublicKey(authority);
            const mintPublicKey = new anchor_1.web3.PublicKey(mint);
            const baseMintPublicKey = new anchor_1.web3.PublicKey(baseMint);
            const poolPDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const tokenAccount = yield anchor_1.utils.token.associatedAddress({
                mint: mintPublicKey,
                owner: walletPublicKey,
            });
            const baseTokenAccount = yield anchor_1.utils.token.associatedAddress({
                mint: baseMintPublicKey,
                owner: walletPublicKey,
            });
            const stableTokenAccount = yield anchor_1.utils.token.associatedAddress({
                mint: poolPDAs.stableMint,
                owner: walletPublicKey,
            });
            const lptTokenAccount = yield anchor_1.utils.token.associatedAddress({
                mint: poolPDAs.lptMint,
                owner: walletPublicKey,
            });
            const [cheque] = yield anchor_1.web3.PublicKey.findProgramAddress([
                Buffer.from('cheque'),
                new anchor_1.web3.PublicKey(pool).toBuffer(),
                walletPublicKey.toBuffer(),
            ], this.program.programId);
            const [cert] = yield anchor_1.web3.PublicKey.findProgramAddress([poolPDAs.lptMint.toBuffer(), walletPublicKey.toBuffer()], this.program.programId);
            return {
                cert,
                cheque,
                lptTokenAccount,
                tokenAccount,
                stableTokenAccount,
                baseTokenAccount,
            };
        });
        this.initializePool = (mint, baseMint, fee, amount, stableAmount, baseAmount) => __awaiter(this, void 0, void 0, function* () {
            const pool = anchor_1.web3.Keypair.generate();
            const PDAs = yield this.getPoolPDAs(pool.publicKey, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool.publicKey, mint, baseMint);
            const additionalComputeBudgetInstruction = web3_js_1.ComputeBudgetProgram.requestUnits({
                units: 400000,
                additionalFee: 0,
            });
            const transaction = new web3_js_1.Transaction().add(additionalComputeBudgetInstruction);
            console.log('PDAs', PDAs.lptMint.toBase58());
            const instruction = yield this.program.methods
                .initializePool(fee, amount, stableAmount, baseAmount)
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .instruction();
            transaction.add(instruction);
            const txId = yield this._provider.sendAndConfirm(transaction, [pool]);
            return { txId, address: pool.publicKey };
        });
        this.mintStable = (pool, amount) => __awaiter(this, void 0, void 0, function* () {
            const { mint, baseMint } = yield this.program.account.pool.fetch(pool);
            const PDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool, mint, baseMint);
            const txId = yield this.program.methods
                .mintStable(amount)
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .rpc();
            return { txId };
        });
        this.burnStable = (pool, amount) => __awaiter(this, void 0, void 0, function* () {
            const { mint, baseMint } = yield this.program.account.pool.fetch(pool);
            const PDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool, mint, baseMint);
            const txId = yield this.program.methods
                .burnStable(amount)
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .rpc();
            return { txId };
        });
        this.addLiquidity = (pool, amount, stableAmount, baseAmount) => __awaiter(this, void 0, void 0, function* () {
            const { mint, baseMint } = yield this.program.account.pool.fetch(pool);
            const PDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool, mint, baseMint);
            const txId = yield this.program.methods
                .addLiquidity(amount, stableAmount, baseAmount)
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .rpc();
            return { txId };
        });
        this.removeLiquidity = (pool, lpt_amount) => __awaiter(this, void 0, void 0, function* () {
            const { mint, baseMint } = yield this.program.account.pool.fetch(pool);
            const PDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool, mint, baseMint);
            const txId = yield this.program.methods
                .removeLiquidity(lpt_amount)
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .rpc();
            return { txId };
        });
        this.borrow = (pool, lpt_amount) => __awaiter(this, void 0, void 0, function* () {
            const { mint, baseMint } = yield this.program.account.pool.fetch(pool);
            const PDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool, mint, baseMint);
            const txId = yield this.program.methods
                .borrow(lpt_amount)
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .rpc();
            return { txId };
        });
        this.repay = (pool) => __awaiter(this, void 0, void 0, function* () {
            const { mint, baseMint } = yield this.program.account.pool.fetch(pool);
            const PDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool, mint, baseMint);
            const txId = yield this.program.methods
                .repay()
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .rpc();
            return { txId };
        });
        this.buy = (pool, stable_amount, base_amount) => __awaiter(this, void 0, void 0, function* () {
            const { mint, baseMint } = yield this.program.account.pool.fetch(pool);
            const PDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool, mint, baseMint);
            const txId = yield this.program.methods
                .buy(stable_amount, base_amount)
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .rpc();
            return { txId };
        });
        this.sell = (pool, amount) => __awaiter(this, void 0, void 0, function* () {
            const { mint, baseMint } = yield this.program.account.pool.fetch(pool);
            const PDAs = yield this.getPoolPDAs(pool, mint, baseMint);
            const wallet = this._provider.wallet;
            const tokenAccounts = yield this.getTokenAccounts(wallet.publicKey, pool, mint, baseMint);
            const txId = yield this.program.methods
                .sell(amount)
                .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                .rpc();
            return { txId };
        });
        this.getAllJupiter = () => __awaiter(this, void 0, void 0, function* () {
            return this.program.account.jupiter.all();
        });
        this.getJupiterPDAs = (jupiter, mint = anchor_1.web3.Keypair.generate().publicKey) => __awaiter(this, void 0, void 0, function* () {
            const jupiterPublicKey = new anchor_1.web3.PublicKey(jupiter);
            let mintPublicKey = undefined;
            let mintTreasury = undefined;
            const [treasurer] = yield anchor_1.web3.PublicKey.findProgramAddress([Buffer.from('treasurer'), jupiterPublicKey.toBuffer()], this.program.programId);
            const [baseMint] = yield anchor_1.web3.PublicKey.findProgramAddress([Buffer.from('base_mint'), jupiterPublicKey.toBuffer()], this.program.programId);
            if (mint) {
                mintPublicKey = new anchor_1.web3.PublicKey(mint);
                mintTreasury = yield anchor_1.utils.token.associatedAddress({
                    mint: mintPublicKey,
                    owner: treasurer,
                });
            }
            return {
                jupiter: jupiterPublicKey,
                treasurer,
                mint: mintPublicKey,
                mintTreasury,
                baseMint,
            };
        });
        this.getTokenAccountsJupiter = (authority, mint, baseMint) => __awaiter(this, void 0, void 0, function* () {
            const walletPublicKey = new anchor_1.web3.PublicKey(authority);
            const mintPublicKey = new anchor_1.web3.PublicKey(mint);
            const baseMintPublicKey = new anchor_1.web3.PublicKey(baseMint);
            const tokenAccount = yield anchor_1.utils.token.associatedAddress({
                mint: mintPublicKey,
                owner: walletPublicKey,
            });
            const baseTokenAccount = yield anchor_1.utils.token.associatedAddress({
                mint: baseMintPublicKey,
                owner: walletPublicKey,
            });
            return {
                tokenAccount,
                baseTokenAccount,
            };
        });
        this.initializeJupiter = () => __awaiter(this, void 0, void 0, function* () {
            const jupiter = anchor_1.web3.Keypair.generate();
            const wallet = this._provider.wallet;
            const PDAs = yield this.getJupiterPDAs(jupiter.publicKey);
            const txId = yield this.program.methods
                .initializeJupiter()
                .accounts(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), DEFAULT_PROGRAMS))
                .signers([jupiter])
                .rpc();
            return { txId, address: jupiter.publicKey };
        });
        this.swapJupiter = (baseMint, mint, amountIn, amountOut) => __awaiter(this, void 0, void 0, function* () {
            const listJupiter = yield this.getAllJupiter();
            const wallet = this._provider.wallet;
            for (const jupiter of listJupiter) {
                if (jupiter.account.baseMint.toBase58() !== baseMint.toString())
                    continue;
                const PDAs = yield this.getJupiterPDAs(jupiter.publicKey, mint);
                const tokenAccounts = yield this.getTokenAccountsJupiter(wallet.publicKey, mint, jupiter.account.baseMint);
                console.log('tokenAccounts', tokenAccounts);
                return this.program.methods
                    .swapJupiter(amountIn, amountOut)
                    .accounts(Object.assign(Object.assign(Object.assign({ authority: wallet.publicKey }, PDAs), tokenAccounts), DEFAULT_PROGRAMS))
                    .rpc();
            }
            return null;
        });
        if (!(0, utils_1.isAddress)(programId))
            throw new Error('Invalid program id');
        // Private
        this._provider = provider;
        // Public
        this.program = new anchor_1.Program(constant_1.DEFAULT_IDL, programId, this._provider);
    }
}
__exportStar(require("../target/types/lucid"), exports);
__exportStar(require("./constant"), exports);
__exportStar(require("./utils"), exports);
exports.default = LucidProgram;
