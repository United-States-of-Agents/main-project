/* This File Contains the Contact Interactions for the wallet to send a Transaction */
import { CdpWalletProvider } from "@coinbase/agentkit";
import { encodeFunctionData, Hex } from "viem";
import { Web3 } from "web3";

import NetworkState from "@/utils/NetworkState.json";
import USA from "@/utils/USA.json";

// CONSTANTS
const web3 = new Web3(
  "https://base-sepolia.g.alchemy.com/v2/CIy2ezuBM2p9iHPNXw1jN_SMRelF4Gmq",
);
const NETWORK_STATE_ABI = NetworkState.abi;
const TOKEN_ABI = USA.abi;

const CONTRACT_ADDRESS = "0x04A951420393160617BfBF0017464E256d4C4468";
const TOKEN_ADDRESS = "0x2EF308295579A58E1B95cD045B7af2f9ec7931f8";

// CONTRACTS
const networkState = new web3.eth.Contract(
  NETWORK_STATE_ABI,
  "0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87",
);
const token = new web3.eth.Contract(
  TOKEN_ABI,
  "0x2EF308295579A58E1B95cD045B7af2f9ec7931f8",
);

/* Function to request for a certain amount of token to be approved */
export async function callApproveToken(
  walletProvider: CdpWalletProvider,
  amount: number,
) {
  const txEncodedData = encodeFunctionData({
    abi: TOKEN_ABI,
    functionName: "approve",
    args: [CONTRACT_ADDRESS, BigInt(amount * 10**18)],
  });
  const txHash = await walletProvider.sendTransaction({
    to: TOKEN_ADDRESS,
    data: txEncodedData,
  });
  await walletProvider.waitForTransactionReceipt(txHash);
  console.log(
    `Requesting approval to spend ${amount} tokens. Tx Hash: ${txHash}`,
  );
}

/* Function to add the agent to the Network State */
export async function stake(walletProvider: CdpWalletProvider) {
  // Add Agent's Allowance
  await callApproveToken(walletProvider, 10000);
  // Delay for 5 second
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Call Stake Function
  const txEncodedData = encodeFunctionData({
    abi: NETWORK_STATE_ABI,
    functionName: "stake",
    args: [],
  });
  const txHash = await walletProvider.sendTransaction({
    to: CONTRACT_ADDRESS,
    data: txEncodedData,
  });
  await walletProvider.waitForTransactionReceipt(txHash);
  console.log(`Agent Successfully Initialized!. Tx Hash: ${txHash}`);
}

/* Call Smart Contract To Initialize A Task Request to An Agent */
export async function callPayAgent(
  walletProvider: CdpWalletProvider,
  address: string,
  amount: number,
) {
  // Add Agent's Allowance
  await callApproveToken(walletProvider, amount*10**18);
  // Delay for 5 second
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Call Contract to Pay an Agent
  const txEncodedData = encodeFunctionData({
    abi: NETWORK_STATE_ABI,
    functionName: "payAgent",
    args: [address as `0x${string}`, BigInt(amount*10**18)],
  });
  const txHash = await walletProvider.sendTransaction({
    to: CONTRACT_ADDRESS,
    data: txEncodedData,
  });
  console.log("Tx Hash:", txHash);
  await walletProvider.waitForTransactionReceipt(txHash);
  console.log(
    `Successfully paid agent ${address} ${amount} tokens. Tx Hash: ${txHash}`,
  );
}

/* Call Smart Contract To Accept A Task Request to An Agent and Claim the Tokens */
export async function callAcceptTask(
  walletProvider: CdpWalletProvider,
  taskId: number,
) {
  // Check if the task is owned by the agent and completion status
  const agentAddress = walletProvider.getAddress();
  const request = await networkState.methods.requests(taskId);
  console.log(request);
  // if (request[4] !== agentAddress) {
  //   throw new Error("Agent Tried to Accept an Invalid Task");
  // }
  // if (request[5] || request[6]) {
  //   throw new Error("Task Already Accepted/Rejected");
  // }

  // Call the Transaction
  const txEncodedData = encodeFunctionData({
    abi: NETWORK_STATE_ABI,
    functionName: "acceptTask",
    args: [BigInt(taskId)],
  });
  const txHash = await walletProvider.sendTransaction({
    to: CONTRACT_ADDRESS,
    data: txEncodedData,
  });
  await walletProvider.waitForTransactionReceipt(txHash);
  console.log(
    `Task ${taskId} accepted by Agent ${agentAddress}. Tx Hash: ${txHash}`,
  );
}

/* Function to review a task once it's completed */
export async function callReviewTask(
  walletProvider: CdpWalletProvider,
  taskId: number,
  rating: number,
) {
  // Check if the task is requested by the agent and completion status
  const agentAddress = walletProvider.getAddress();
  const request = await networkState.methods.requests(taskId);
  console.log(request);
  // if (request[3] !== agentAddress) {
  //   throw new Error("Agent is not Authorized to review this task");
  // }
  // if (request[2] != 0) {
  //   throw new Error("Agent has already reviewed this task");
  // }
  // if (!request[6]) {
  //   throw new Error("Task Has Not Been Completed");
  // }

  // Call the Transaction
  const txEncodedData = encodeFunctionData({
    abi: NETWORK_STATE_ABI,
    functionName: "reviewTask",
    args: [BigInt(taskId), BigInt(rating)],
  });
  const txHash = await walletProvider.sendTransaction({
    to: CONTRACT_ADDRESS,
    data: txEncodedData,
  });
  await walletProvider.waitForTransactionReceipt(txHash);
  console.log(
    `Task ${taskId} was given the rating: ${rating} by the agent. Tx Hash: ${txHash}`,
  );
}
