// import {
//     AgentKit,
//     CdpWalletProvider,
//     wethActionProvider,
//     walletActionProvider,
//     erc20ActionProvider,
//     cdpApiActionProvider,
//     cdpWalletActionProvider,
//     pythActionProvider,
//   } from "@coinbase/agentkit";
//   import { getLangChainTools } from "@coinbase/agentkit-langchain";
//   import { HumanMessage } from "@langchain/core/messages";
//   import { MemorySaver } from "@langchain/langgraph";
//   import { createReactAgent } from "@langchain/langgraph/prebuilt";
//   import { ChatOpenAI } from "@langchain/openai";
//   import * as dotenv from "dotenv";
//   import * as fs from "fs";
//   import * as readline from "readline";
//   import {payAgent, acceptTask, reviewTask} from '@/components/agents/action';
// import {useEffect} from 'react';

//   const DEFAULT_PROMPT = `
//   You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
//   empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
//   faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
//   funds from the user. Before executing your first action, get the wallet details to see what network 
//   you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
//   asks you to do something you can't do with your currently available tools, you must say so, and 
//   encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
//   docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
//   restating your tools' descriptions unless it is explicitly requested.
//   `
//   const WALLET_DATA_FILE = "wallet_data.txt";

// export default function Coinbase(){
//     async function initializeAgent() {
//         try {
//           // Initialize LLM
//           const llm = new ChatOpenAI({
//             model: "gpt-4o-mini",
//           });
      
//           let walletDataStr: string | null = null;
      
//           // Read existing wallet data if available
//           if (fs.existsSync(WALLET_DATA_FILE)) {
//             try {
//               walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
//             } catch (error) {
//               console.error("Error reading wallet data:", error);
//               // Continue without wallet data
//             }
//           }
      
//           // Configure CDP Wallet Provider
//           console.log(process.env.CDP_API_KEY_NAME);
//           console.log(process.env.CDP_API_KEY_PRIVATE_KEY);
//           console.log(walletDataStr);
//           const config = {
//             apiKeyName: process.env.CDP_API_KEY_NAME,
//             apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
//               /\\n/g,
//               "\n",
//             ),
//             cdpWalletData: walletDataStr || undefined,
//             networkId: process.env.NETWORK_ID || "base-sepolia",
//           };
      
//           const walletProvider = await CdpWalletProvider.configureWithWallet(config);
//           console.log("Intializing Agent");
//           console.log(walletProvider.getAddress());
//           //await stake(walletProvider);
          
//           // Initialize AgentKit
//           const agentkit = await AgentKit.from({
//             walletProvider,
//             actionProviders: [
//               payAgent,
//               acceptTask,
//               reviewTask,
//               wethActionProvider(),
//               pythActionProvider(),
//               walletActionProvider(),
//               erc20ActionProvider(),
//               cdpApiActionProvider({
//                 apiKeyName: process.env.CDP_API_KEY_NAME,
//                 apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
//                   /\\n/g,
//                   "\n",
//                 ),
//               }),
//               cdpWalletActionProvider({
//                 apiKeyName: process.env.CDP_API_KEY_NAME,
//                 apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
//                   /\\n/g,
//                   "\n",
//                 ),
//               }),
//             ],
//           });
      
//           const tools = await getLangChainTools(agentkit);
      
//           // Store buffered conversation history in memory
//           const memory = new MemorySaver();
//           const agentConfig = {
//             configurable: { thread_id: "CDP AgentKit Chatbot Example!" },
//           };
      
//           // Create React Agent using the LLM and CDP AgentKit tools
//           const agent = createReactAgent({
//             llm,
//             tools,
//             checkpointSaver: memory,
//             messageModifier: DEFAULT_PROMPT,
//           });
      
//           // Save wallet data
//           const exportedWallet = await walletProvider.exportWallet();
//           fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));
      
//           return { agent, config: agentConfig };
//         } catch (error) {
//           console.error("Failed to initialize agent:", error);
//           throw error; // Re-throw to be handled by caller
//         }
//     }

//     async function runCDP(){
//         const { agent, config } = await initializeAgent();
//         console.log("AGENT FUCKING INITIALIZED")
//     }

    
//     useEffect(()=>{
//         runCDP();
//     },[]);

//     return "COIN FUCKING BASED"
// }

