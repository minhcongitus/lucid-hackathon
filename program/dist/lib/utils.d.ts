import { Address, Provider } from '@project-serum/anchor';
import { WalletInterface } from './rawWallet';
/**
 * Validate an address
 * @param address Base58 string
 * @returns true/false
 */
export declare const isAddress: (address?: Address | undefined) => address is Address;
export declare const getAnchorProvider: (node: string, walletAddress: string, wallet: WalletInterface) => Provider;
