import { clusterApiUrl } from "@solana/web3.js";

// XXX: re-use list from `contexts/connection` ?
export const ENDPOINTS = [
  {
    name: "mainnet-beta",
    endpoint: "https://api.metaplex.solana.com/",
  },
  {
    name: "testnet",
    endpoint: clusterApiUrl("testnet"),
  },
  {
    name: "devnet",
    endpoint: clusterApiUrl("devnet"),
  },
];
