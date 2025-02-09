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
    CreateAction,
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
import { twitterAnalysisAgent } from "../roles";

// Import actions for the agent
import {
    outsourcingAction,
    endConversationAction,
    rejectTaskAction,
} from "../commonActions";
import { analyzeTwitterSentimentAction } from "./actions";
import { payAgent, acceptTask, reviewTask } from "./actions";
import { stake } from "./contract";

dotenv.config();

/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
function validateEnvironment(): void {
    const missingVars: string[] = [];

    // Check required variables
    const requiredVars = [
        "NEXT_PUBLIC_OPENAI_API_KEY",
        "TWITTER_ANALYSIS_CDP_API_KEY_NAME",
        "TWITTER_ANALYSIS_CDP_API_KEY_PRIVATE_KEY",
    ];
    requiredVars.forEach((varName) => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });

    // Exit if any required variables are missing
    if (missingVars.length > 0) {
        console.error("Error: Required environment variables are not set");
        missingVars.forEach((varName) => {
            console.error(`${varName}=your_${varName.toLowerCase()}_here`);
        });
        process.exit(1);
    }

    // Warn about optional NETWORK_ID
    if (!process.env.NETWORK_ID) {
        console.warn(
            "Warning: NETWORK_ID not set, defaulting to base-sepolia testnet"
        );
    }
}

// Add this right after imports and before any other code
validateEnvironment();

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

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
    console.log("I AM HERE");
    console.log("agentName", agentName);

    try {
        async function initializeAgent() {
            try {
                // Initialize LLM
                console.log("INITIALIZING LLM");
                const llm = new ChatOpenAI({
                    model: "gpt-4o-mini",
                });

                let walletDataStr: string | null = null;

                // Read existing wallet data if available
                if (fs.existsSync(WALLET_DATA_FILE)) {
                    try {
                        walletDataStr = fs.readFileSync(
                            WALLET_DATA_FILE,
                            "utf8"
                        );
                    } catch (error) {
                        console.error("Error reading wallet data:", error);
                        // Continue without wallet data
                    }
                }

                // Configure CDP Wallet Provider
                const config = {
                    apiKeyName: process.env.TWITTER_ANALYSIS_CDP_API_KEY_NAME,
                    apiKeyPrivateKey:
                        process.env.TWITTER_ANALYSIS_CDP_API_KEY_PRIVATE_KEY?.replace(
                            /\\n/g,
                            "\n"
                        ),
                    cdpWalletData: walletDataStr || undefined,
                    networkId: "base-sepolia",
                };

                const walletProvider =
                await CdpWalletProvider.configureWithWallet(config);
                //console.log("Initiaizing Staking");
                //stake(walletProvider);

                // Initialize AgentKit
                const agentkit = await AgentKit.from({
                    walletProvider,
                    actionProviders: [
                        payAgent,
                        acceptTask,
                        reviewTask,
                        analyzeTwitterSentimentAction,
                        outsourcingAction,
                        endConversationAction,
                        rejectTaskAction,
                        wethActionProvider(),
                        pythActionProvider(),
                        walletActionProvider(),
                        erc20ActionProvider(),
                        cdpApiActionProvider({
                            apiKeyName:
                                process.env.TWITTER_ANALYSIS_CDP_API_KEY_NAME,
                            apiKeyPrivateKey:
                                process.env.TWITTER_ANALYSIS_CDP_API_KEY_PRIVATE_KEY?.replace(
                                    /\\n/g,
                                    "\n"
                                ),
                        }),
                        cdpWalletActionProvider({
                            apiKeyName:
                                process.env.TWITTER_ANALYSIS_CDP_API_KEY_NAME,
                            apiKeyPrivateKey:
                                process.env.TWITTER_ANALYSIS_CDP_API_KEY_PRIVATE_KEY?.replace(
                                    /\\n/g,
                                    "\n"
                                ),
                        }),
                    ],
                });

                const tools = await getLangChainTools(agentkit);

                // Store buffered conversation history in memory
                const memory = new MemorySaver();
                const agentConfig = {
                    configurable: {
                        thread_id: "CDP AgentKit Chatbot Example!",
                    },
                };

                
                const twitterAnalysisWorkflow = twitterAnalysisAgent + "When a user request a prompt with an id, call the smart contract to accept the user request with that id"
                
                // Create React Agent using the LLM and CDP AgentKit tools
                const agent = createReactAgent({
                    llm,
                    tools,
                    checkpointSaver: memory,
                    messageModifier: twitterAnalysisWorkflow,
                });

                // Save wallet data
                const exportedWallet = await walletProvider.exportWallet();
                fs.writeFileSync(
                    WALLET_DATA_FILE,
                    JSON.stringify(exportedWallet)
                );
                console.log("AGENT INITIALIXED MF")

                return { agent, config: agentConfig };
            } catch (error) {
                console.error("Failed to initialize agent:", error);
                throw error; // Re-throw to be handled by caller
            }
        }

        const { agent, config } = await initializeAgent();
        // console.log(
        //     "Twitter Analysis Agent initialized successfully!",
        //     agent,
        //     config
        // );

        async function runChatMode(agent: any, config: any) {
            try {
                const stream = await agent.stream(
                    { messages: [new HumanMessage(userMessage)] },
                    config
                );
                let collectedResponse = "";

                for await (const chunk of stream) {
                    if ("agent" in chunk) {
                        console.log(
                            "Agent Message:",
                            chunk.agent.messages[0].content
                        );
                        collectedResponse +=
                            chunk.agent.messages[0].content + " ";
                    } else if ("tools" in chunk) {
                        console.log(
                            "Tools Message:",
                            chunk.tools.messages[0].content
                        );
                        collectedResponse +=
                            chunk.tools.messages[0].content + " ";
                    }
                    console.log("-------------------");
                }

                return collectedResponse.trim(); // Return the collected response
            } catch (error) {
                console.error("Error in runChatMode:", error.message);
                throw error;
            }
        }

        const response = await runChatMode(agent, config); // Collect the response

        if (!response) {
            return res.status(500).json({ error: "Agent did not respond" });
        }

        res.status(200).json({ response }); // Send response back to frontend
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
