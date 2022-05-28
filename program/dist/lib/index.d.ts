import { Address, Program, web3, AnchorProvider, IdlAccounts, BN } from '@project-serum/anchor';
import { Lucid } from './../target/types/lucid';
export declare type PoolData = IdlAccounts<Lucid>['pool'];
declare class LucidProgram {
    private _provider;
    readonly program: Program<Lucid>;
    constructor(provider: AnchorProvider, programId: Address);
    getPoolPDAs: (pool: Address, mint: Address, baseMint: Address) => Promise<{
        pool: Address;
        treasurer: web3.PublicKey;
        mint: Address;
        stableMint: web3.PublicKey;
        baseMint: Address;
        lptMint: web3.PublicKey;
        treasury: web3.PublicKey;
        stableTreasury: web3.PublicKey;
        baseTreasury: web3.PublicKey;
        lptTreasury: web3.PublicKey;
    }>;
    getTokenAccounts: (authority: Address, pool: Address, mint: Address, baseMint: Address) => Promise<{
        cert: web3.PublicKey;
        cheque: web3.PublicKey;
        lptTokenAccount: web3.PublicKey;
        tokenAccount: web3.PublicKey;
        stableTokenAccount: web3.PublicKey;
        baseTokenAccount: web3.PublicKey;
    }>;
    initializePool: (mint: Address, baseMint: Address, fee: BN, amount: BN, stableAmount: BN, baseAmount: BN) => Promise<{
        txId: string;
        address: web3.PublicKey;
    }>;
    mintStable: (pool: Address, amount: BN) => Promise<{
        txId: string;
    }>;
    burnStable: (pool: Address, amount: BN) => Promise<{
        txId: string;
    }>;
    addLiquidity: (pool: Address, amount: BN, stableAmount: BN, baseAmount: BN) => Promise<{
        txId: string;
    }>;
    removeLiquidity: (pool: Address, lpt_amount: BN) => Promise<{
        txId: string;
    }>;
    borrow: (pool: Address, lpt_amount: BN) => Promise<{
        txId: string;
    }>;
    repay: (pool: Address) => Promise<{
        txId: string;
    }>;
    buy: (pool: Address, stable_amount: BN, base_amount: BN) => Promise<{
        txId: string;
    }>;
    sell: (pool: Address, amount: BN) => Promise<{
        txId: string;
    }>;
    getAllJupiter: () => Promise<import("@project-serum/anchor").ProgramAccount<import("@project-serum/anchor/dist/cjs/program/namespace/types").TypeDef<{
        name: "cert";
        type: {
            kind: "struct";
            fields: [{
                name: "authority";
                type: "publicKey";
            }, {
                name: "pool";
                type: "publicKey";
            }, {
                name: "amount";
                type: "u64";
            }];
        };
    } | {
        name: "cheque";
        type: {
            kind: "struct";
            fields: [{
                name: "authority";
                type: "publicKey";
            }, {
                name: "pool";
                type: "publicKey";
            }, {
                name: "borrowAmount";
                type: "u64";
            }, {
                name: "baseAmount";
                type: "u64";
            }];
        };
    } | {
        name: "jupiter";
        type: {
            kind: "struct";
            fields: [{
                name: "baseMint";
                type: "publicKey";
            }];
        };
    } | {
        name: "pool";
        type: {
            kind: "struct";
            fields: [{
                name: "authority";
                type: "publicKey";
            }, {
                name: "mint";
                type: "publicKey";
            }, {
                name: "baseMint";
                type: "publicKey";
            }, {
                name: "stableMint";
                type: "publicKey";
            }, {
                name: "lptMint";
                type: "publicKey";
            }, {
                name: "treasurer";
                type: "publicKey";
            }, {
                name: "balance";
                type: "u64";
            }, {
                name: "stableBalance";
                type: "u64";
            }, {
                name: "baseBalance";
                type: "u64";
            }, {
                name: "fee";
                type: "u64";
            }, {
                name: "totalLptFee";
                type: "u64";
            }, {
                name: "lptSupply";
                type: "u64";
            }, {
                name: "startTime";
                type: "i64";
            }];
        };
    }, import("@project-serum/anchor").IdlTypes<Lucid>>>[]>;
    getJupiterPDAs: (jupiter: Address, mint?: Address) => Promise<{
        jupiter: web3.PublicKey;
        treasurer: web3.PublicKey;
        mint: web3.PublicKey | undefined;
        mintTreasury: web3.PublicKey | undefined;
        baseMint: web3.PublicKey;
    }>;
    getTokenAccountsJupiter: (authority: Address, mint: Address, baseMint: Address) => Promise<{
        tokenAccount: web3.PublicKey;
        baseTokenAccount: web3.PublicKey;
    }>;
    initializeJupiter: () => Promise<{
        txId: string;
        address: web3.PublicKey;
    }>;
    swapJupiter: (baseMint: Address, mint: Address, amountIn: BN, amountOut: BN) => Promise<string | null>;
}
export * from '../target/types/lucid';
export * from './constant';
export * from './utils';
export default LucidProgram;
