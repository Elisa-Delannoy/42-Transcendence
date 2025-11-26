import { ethers } from "ethers";
import * as dotenv from "dotenv";

// if "module": "ESNext", can use : import dotenv from "dotenv";


// Prepare env variables
dotenv.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = process.env.RPC_URL!; // Fuji Testnet RPC
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

// Export abi
const abi = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "uint256[8]", "name": "_ranking", "type": "uint256[8]" }
    ],
    "name": "addTournamentOnChain",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "getTournamentOnChain",
    "outputs": [{ "internalType": "uint256[8]", "name": "", "type": "uint256[8]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllTournamentsOnChain",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalTournamentsOnChain",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
export default abi;

// Provider + Wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// New instance of contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// Transaction queue to ensure sequential transactions
let txQueue: Promise<void> = Promise.resolve();

/**
 * Upload a single tournament result onchain
 */
export async function addTournamentResult(
  tournamentId: number,
  ranking: number[]
): Promise<void> {
  if (ranking.length !== 8) throw new Error("Ranking must contain 8 player IDs");

  txQueue = txQueue.then(async () => {
    try {
      const tx = await contract.addTournamentOnChain(tournamentId, ranking);
      await tx.wait();
      console.log(`Tournament ${tournamentId} uploaded onchain successfully!`);
    } catch (err) {
      console.error(`Error uploading tournament ${tournamentId} onchain:`, err);
      throw err;
    }
  });
  return txQueue;
}

/**
 * Query one tournament onchain
 */
export async function getTournament(tournamentId: number): Promise<number[]> {
  try {
    const ranking: bigint[] = await contract.getTournamentOnChain(tournamentId);
    const result = ranking.map((v: bigint) => Number(v));
    //console.log(`Tournament ${tournamentId} onchain rankings:`, result);
    return result;
  } catch (err) {
    console.error(`❌ Error querying tournament ${tournamentId} onchain:`, err);
    throw err;
  }
}

/**
 * Query total number of tournaments onchain
 */
export async function getTotalTournaments(): Promise<number> {
  try {
    const total: bigint = await contract.getTotalTournamentsOnChain();
    const numberTotal = Number(total);
    console.log("Total tournaments onchain:", numberTotal);
    return numberTotal;
  } catch (err) {
    console.error("❌ Error querying total tournaments onchain:", err);
    throw err;
  }
}

/**
 * Query all tournaments onchain
 */
export async function getAllOnChainTournaments() {
  const ids: bigint[] = await contract.getAllTournamentsOnChain(); // [1,2,5,6]
  const result = [];

  for (const id of ids) {
    const ranking: bigint[] = await contract.getTournamentOnChain(Number(id));
    result.push({
      tournamentId: Number(id),
      ranking: ranking.map((v) => Number(v)),
    });
  }

  return result;
}
