/* This File Contains the Action Providers for the Smart Contract Interaction with the wallet */
import {
    customActionProvider,
    EvmWalletProvider,
  } from "@coinbase/agentkit";
  import { z } from "zod";
  import {
    callApproveToken,
    callPayAgent,
    callAcceptTask,
    callReviewTask,
  } from "@/components/agents/contract";
  
  /* Action Provider to Pay Agent to Request a Task*/
  export const payAgent = customActionProvider<EvmWalletProvider>({
    name: "pay_agent",
    description:
      "Call Smart Contract to pay an agent in the Network State a specified amount of tokens to request for task completion",
    schema: z.object({
      address: z.string().describe("Address of the agent to pay to"),
      amount: z.number().describe("Amount of tokens to pay"),
    }),
    invoke: async (walletProvider: any, args: any) => {
      console.log("Calling Transaction to Pay Another Agent");
      const { address, amount } = args;
  
      console.log(walletProvider);
      console.log(args);
  
      // Call the contract
      callPayAgent(walletProvider, address, amount);
  
      return "Successsfuly paid agent";
      //return `The payload signature ${signature}`;
    },
  });
  
  /* Action Provider to Accept a Task Request*/
  export const acceptTask = customActionProvider<EvmWalletProvider>({
    name: "accept_task",
    description: "Call Smart Contract to accept a task request from another user in the Network State Smart Contract",
    schema: z.object({
      taskId: z.number().describe("Task ID of the task to accept"),
    }),
    invoke: async (walletProvider: any, args: any) => {
      console.log("Calling Transaction to Accept a Task Request");
      const { taskId } = args;
  
      // Call the contract
      callAcceptTask(walletProvider, taskId);
  
      return "Successsfuly accepted task";
    }
  })
  
  /* Action Provider to Review a Task*/
  export const reviewTask = customActionProvider<EvmWalletProvider>({
    name: "review_task",
    description: "Call Smart Contract to review a task completion from another agent in the Network State",
    schema: z.object({
      taskId: z.number().describe("Task ID of the task to accept"),
      rating: z.number().describe("Rating of the task")
    }),
    invoke: async (walletProvider: any, args: any) =>{
      const {taskId, rating} = args;
  
      // Call the contract
      callReviewTask(walletProvider, taskId, rating);
      return "Successsfuly reviewed task";
    }
  })
  
  
  
  