import { ethers } from "ethers";

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = process.env.RPC_URL!; // Fuji Testnet RPC
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

const abi = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "int256[8]", "name": "_ranking", "type": "int256[8]" }
    ],
    "name": "addTournamentOnChain",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "getTournamentOnChain",
    "outputs": [{ "internalType": "int256[8]", "name": "", "type": "int256[8]" }],
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

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
let txQueue: Promise<void> = Promise.resolve();

/**
 * Upload a single tournament result onchain
 */
export type UploadResult =
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "error"; error: string };

export async function addTournamentResult(
  tournamentId: number,
  ranking: number[]
): Promise<UploadResult> {
  if (ranking.length !== 8) {
    return { status: "error", error: "Ranking must contain 8 player IDs" };
  }

  let result: UploadResult = { status: "success" };
  txQueue = txQueue.then(async () => {
    try {
      const tx = await contract.addTournamentOnChain(tournamentId, ranking);
      await tx.wait();
    } catch (err: any) {
      const message =
        err?.reason ?? err?.error?.message ?? err?.message ?? "Unknown error";

      if (message.includes("Tournament already exists")) {
        result = { status: "duplicate" };
      } else {
        console.error(`Tournament ${tournamentId} upload failed`, message);
        result = { status: "error", error: message };
      }
    }
  });
  await txQueue;
  return result;
}

/**
 * Query one tournament onchain
 */
export async function getTournament(tournamentId: number): Promise<number[]> {
  try {
    const ranking: bigint[] = await contract.getTournamentOnChain(tournamentId);
    const result = ranking.map((v: bigint) => Number(v));
    return result;
  } catch (err: any) {
    const message = err?.reason ?? err?.error?.message ?? err?.message ?? "Unknown error";
    throw new Error(
      `On-chain data inconsistent for tournament ${tournamentId}: ${message}`
    );
  }
}

/**
 * Query total number of tournaments onchain
 */
export async function getTotalTournaments(): Promise<number> {
  try {
    const total: bigint = await contract.getTotalTournamentsOnChain();
    const numberTotal = Number(total);
    return numberTotal;
  } catch (err) {
    console.error("Error querying total tournaments onchain:", err);
    throw new Error("Blockchain unavailable");
  }
}

/**
 * Query all tournaments onchain
 */
export async function getAllOnChainTournaments() {
  const ids: bigint[] = await contract.getAllTournamentsOnChain();
  const result = [];

  for (const id of ids) {
    try {
      const ranking: bigint[] = await contract.getTournamentOnChain(Number(id));
      result.push({
        tournamentId: Number(id),
        ranking: ranking.map((v) => Number(v)),
      });
    } catch (err) {
      console.warn(`Skip tournament ${id.toString()} due to error`);
    }
  }

  return result;
}
