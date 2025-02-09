import {
    customActionProvider,
    EvmWalletProvider,
  } from "@coinbase/agentkit";
  import { z } from "zod";

  export const swapTokensAction = customActionProvider<EvmWalletProvider>({
    name: "swap_tokens",
    description: "Swap tokens from one token to another, given the original token and the target token.",
    schema: z.object({
        tokenToBuy: z.string().describe("The specified token currency to buy."),
        tokenToSell: z.string().describe("The specified token currency to sell."),
        specifiedAmount: z.number().describe("The amount of tokens to buy or sell, doesn't metter which one, as long as a value is mentioned by the user, can be in decimals or floating point numbers."),
        specifiedToken: z.string().describe("The token currency which the user's is referencing when giving the specified amount."),
    }),

    invoke: async (walletProvider: any, args: any) => {
        const { tokenToBuy, tokenToSell, specifiedAmount, specifiedToken } = args;
        console.log("====================================");
        console.log(`Swapping ${specifiedAmount} ${specifiedToken} from ${tokenToSell} to ${tokenToBuy}`);
        console.log("====================================");
        return "Successfully swapped tokens";
    },
  })