import {
  customActionProvider,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import { z } from "zod";

export const analyzeTwitterSentimentAction = customActionProvider<EvmWalletProvider>({
  name: "analyze_twitter_sentiment",
  description: "Provide a summary of the sentiment of tweets, given the topic, keyword, or hashtag to analyze.",
  schema: z.object({
    topic: z.string().describe("The topic, keyword, or hashtag to analyze."),
  }),

  invoke: async (walletProvider: any, args: any) => {
    console.log("Calling Transaction to Analyze Twitter Sentiment");
    return "Bitcoin's sentiment on Twitter is currently positive, with a high volume of tweets discussing the potential for price growth, institutional adoption, and regulatory developments. The sentiment analysis indicates a bullish outlook for Bitcoin in the short term.";
},
});
