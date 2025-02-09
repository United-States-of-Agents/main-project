import {
    AgentKit,
    CdpWalletProvider,
    wethActionProvider,
    walletActionProvider,
    erc20ActionProvider,
    cdpApiActionProvider,
    cdpWalletActionProvider,
    pythActionProvider,
    ActionProvider,
    WalletProvider,
    Network,
    CreateAction
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { researchAgent } from "../roles";

// Import actions
import { outsourcingAction, endConversationAction, rejectTaskAction } from "../commonActions";
import { researchTopicAction } from "./actions";

dotenv.config();

function validateEnvironment(): void {
    const missingVars: string[] = [];
    const requiredVars = ["NEXT_PUBLIC_OPENAI_API_KEY", "CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"];
    
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });

    if (missingVars.length > 0) {
        console.error("Error: Required environment variables are not set");
        missingVars.forEach(varName => {
            console.error(`${varName}=your_${varName.toLowerCase()}_here`);
        });
        process.exit(1);
    }

    if (!process.env.NETWORK_ID) {
        console.warn("Warning: NETWORK_ID not set, defaulting to base-sepolia testnet");
    }
}

validateEnvironment();

const WALLET_DATA_FILE = "researcher_wallet_data.txt";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { agentName, userMessage } = req.body;
    
    if (!agentName || !userMessage) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        async function initializeAgent() {
            try {
                const llm = new ChatOpenAI({
                    model: "gpt-4-turbo-preview",
                });
            
                let walletDataStr: string | null = null;
                if (fs.existsSync(WALLET_DATA_FILE)) {
                    try {
                        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
                    } catch (error) {
                        console.error("Error reading wallet data:", error);
                    }
                }
            
                const config = {
                    apiKeyName: process.env.CDP_API_KEY_NAME,
                    apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                    cdpWalletData: walletDataStr || undefined,
                    networkId: "base-sepolia",
                };
            
                const walletProvider = await CdpWalletProvider.configureWithWallet(config);
            
                const agentkit = await AgentKit.from({
                    walletProvider,
                    actionProviders: [
                        researchTopicAction,
                        outsourcingAction,
                        endConversationAction,
                        rejectTaskAction,
                        wethActionProvider(),
                        pythActionProvider(),
                        walletActionProvider(),
                        erc20ActionProvider(),
                        cdpApiActionProvider({
                            apiKeyName: process.env.CDP_API_KEY_NAME,
                            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                        }),
                        cdpWalletActionProvider({
                            apiKeyName: process.env.CDP_API_KEY_NAME,
                            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                        }),
                    ],
                });
            
                const tools = await getLangChainTools(agentkit);
            
                const memory = new MemorySaver();
                const agentConfig = { configurable: { thread_id: "Research & Education Agent" } };
            
                const agent = createReactAgent({
                    llm,
                    tools,
                    checkpointSaver: memory,
                    messageModifier: researchAgent,
                });
            
                const exportedWallet = await walletProvider.exportWallet();
                fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));
            
                return { agent, config: agentConfig };
            } catch (error) {
                console.error("Failed to initialize research agent:", error);
                throw error;
            }
        }

        const { agent, config } = await initializeAgent();
        console.log("Research Agent initialized successfully!");

        async function runChatMode(agent: any, config: any) {
            console.log("Starting research chat mode...");
            
            try {
                const stream = await agent.stream(
                    { messages: [new HumanMessage(userMessage)] }, 
                    config
                );
            
                for await (const chunk of stream) {
                    if ("agent" in chunk) {
                        console.log(chunk.agent.messages[0].content);
                    } else if ("tools" in chunk) {
                        console.log(chunk.tools.messages[0].content);
                    }
                    console.log("-------------------");
                }
            } catch (error) {
                console.error("Error in research chat:", error);
                throw error;
            }
        }
        
        await runChatMode(agent, config);
        
        res.status(200).json({
            message: "Research completed",
            // Add actual response data here
        });
    } catch (error) {
        console.error("Research Agent Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}