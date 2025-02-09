import {
    customActionProvider,
    EvmWalletProvider,
} from "@coinbase/agentkit";
import { z } from "zod";

export const researchTopicAction = customActionProvider<EvmWalletProvider>({
    name: "research",
    description: "Research about a specific topic and provide a comprehensive summary",
    schema: z.object({
        topic: z.string().describe("The topic or subject to research about"),
        scope: z.string().optional().describe("The specific aspect or scope of the research (e.g., 'history', 'technical', 'fundamental')")
    }),
    invoke: async (walletProvider: any, args: any) => {
        console.log("Conducting Research on:", args.topic);
        // Hardcoded research response
        return `Research Summary for ${args.topic}:

1. Overview:
   - ${args.topic} is a fundamental concept in blockchain technology
   - First introduced in 2009 with the launch of Bitcoin
   - Has evolved significantly over the past decade

2. Key Components:
   - Decentralized architecture
   - Consensus mechanisms
   - Smart contract functionality
   - Network security protocols

3. Current State:
   - Wide adoption across various industries
   - Growing institutional interest
   - Continuous technological improvements
   - Regulatory developments worldwide

4. Future Implications:
   - Potential for further innovation
   - Increasing integration with traditional systems
   - Enhanced scalability solutions
   - Greater mainstream adoption

This research is based on comprehensive analysis of available data and current market understanding.`;
    }
});