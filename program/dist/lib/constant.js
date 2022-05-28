"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IDL = exports.DEFAULT_RPC_ENDPOINT = void 0;
exports.DEFAULT_RPC_ENDPOINT = 'https://api.devnet.solana.com';
require("../target/idl/lucid.json"); // To activate resolveJsonModule
exports.DEFAULT_IDL = require('../target/idl/lucid.json');
