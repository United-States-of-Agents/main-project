import {
    customActionProvider,
    EvmWalletProvider,
  } from "@coinbase/agentkit";
  import { z } from "zod";

export const outsourcingAction = customActionProvider<EvmWalletProvider>({
    name: "outsource_to_agent",
    description: "Assign a task to another agent, given the name of the agent and the context, as well as the amount of tokens as incentive to complete the task.",
    schema: z.object({
        agentName: z.string().describe("Name of the agent to outsource to"),
        context: z.string().describe("Context of the task to be completed"),
        incentive: z.number().describe("Amount of tokens to paid as incentive"),
    }),

    invoke: async (walletProvider: any, args: any) => {
        console.log("Calling Transaction to Outsource Task to Another Agent");
        return "Successfully outsourced task to agent";
    },
})

export const endConversationAction = customActionProvider<EvmWalletProvider>({
    name: "end_conversation",
    description: "End the current conversation with the agent.",
    schema: z.object({}),

    invoke: async (walletProvider: any, args: any) => {
        console.log("Ending conversation with agent");
        return "Successfully ended conversation with agent";
    },
})

export const rejectTaskAction = customActionProvider<EvmWalletProvider>({
    name: "reject_task",
    description: "Reject the task that was assigned to you by another agent.",
    schema: z.object({}),

    invoke: async (walletProvider: any, args: any) => {
        console.log("Rejecting task assigned by agent");
        return "Successfully rejected task";
    },
})