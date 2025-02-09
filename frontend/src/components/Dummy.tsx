import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventBus } from "../game/EventBus";
import { SendHorizonal, X } from "lucide-react";
import { MiniAgentProfile } from "./MiniAgentProfile";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
    useReadContract,
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import {
    networkStateContractConfig,
    tokenContractConfig,
} from "@/utils/wagmiContractConfig";
import { Web3 } from "web3";
import NetworkState from "@/utils/NetworkState.json";
import USA from "@/utils/USA.json";

const web3 = new Web3(
    "https://base-sepolia.g.alchemy.com/v2/CIy2ezuBM2p9iHPNXw1jN_SMRelF4Gmq"
);
const abi = NetworkState.abi;
const networkState = new web3.eth.Contract(
    abi,
    "0x04A951420393160617BfBF0017464E256d4C4468"
);
const token = new web3.eth.Contract(
    USA.abi,
    "0x2EF308295579A58E1B95cD045B7af2f9ec7931f8"
);

const DEFAULT_AGENT_ADDRESS = "0x13CA33C2F70145A960E030ef32509cA49702538d";

type ChatMessage =
    | { sender: "user"; text: string }
    | { sender: "agent"; text: string }
    | { sender: "typing" };

const AGENT_RESPONSES: Record<string, string[]> = {
    Marcus: ["Hello!", "How can I help?", "Nice to meet you!"],
    Julie: ["Hey there!", "What do you need?", "I'm busy but I'll chat."],
    Leonardo: ["Greetings!", "Need assistance?", "Always here to help."],
    Alan: ["Hi!", "Have any questions?", "Let's talk."],
    Troy: ["Yo!", "What brings you here?", "Nice to see you."],
    Linda: ["Hey!", "Hope you're having a great day!", "Let's chat!"],
};

type AgentData = {
    [key: string]: {
        url: string;
        address?: string;
    };
};

const agentData: AgentData = {
    Sara: {
        url: "/api/travelling-salesman",
    },
    Leonardo: {
        url: `/api/coinbase-agents/twitterAnalysisAgent/agent`,
        address: "0x13CA33C2F70145A960E030ef32509cA49702538d",
    },
};

const TIP_AMOUNTS = [1, 5, 10, 25, 50, 75, 100];

export function ChatInterface({
    isChatting,
    currentAgent,
    onClose,
}: {
    isChatting: boolean;
    currentAgent: string | null;
    onClose: () => void;
}) {
    const [chatHistory, setChatHistory] = useState<
        Record<string, ChatMessage[]>
    >({});
    const [message, setMessage] = useState("");
    const [tipAmount, setTipAmount] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { address } = useAccount();
    const allowanceConfig = {
        ...tokenContractConfig,
        functionName: "allowance",
        args: [address, "0x04A951420393160617BfBF0017464E256d4C4468"],
    };
    const { data: allowance } = useReadContract(allowanceConfig as any);
    const { writeContract: approveToken } = useWriteContract();
    const { writeContract } = useWriteContract();

    async function getTaskId() {
        const taskId: number = await networkState.methods
            .requestCounter()
            .call();
        return taskId;
    }

    useEffect(() => {
        async function checkAllowance() {}
    }, []);

    useEffect(() => {
        if (isChatting && currentAgent) {
            setChatHistory((prev) => ({
                ...prev,
                [currentAgent]: prev[currentAgent] || [],
            }));

            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isChatting, currentAgent]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleSendMessage = async () => {
        if (!message.trim() || !currentAgent) return;
        setChatHistory((prev) => ({
            ...prev,
            [currentAgent]: [
                ...(prev[currentAgent] || []),
                { sender: "user", text: message },
            ],
        }));

        EventBus.emit("agent-message", {
            agentId: currentAgent,
            text: message,
        });

        setMessage("");
        setTipAmount(null);

        // Show animated "..." before response
        setTimeout(() => {
            setChatHistory((prev) => ({
                ...prev,
                [currentAgent]: [
                    ...(prev[currentAgent] || []),
                    { sender: "typing" },
                ],
            }));
        }, 500);

        // Fetch response from agent
        if (agentData[currentAgent]) {
            try {
                console.log("here");
                const response = await fetch(agentData[currentAgent].url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        agentName: currentAgent,
                        userMessage: message,
                    }),
                });

                const data = await response.json();
                const agentResponse = data.response;

                setChatHistory((prev) => ({
                    ...prev,
                    [currentAgent]: [
                        ...(prev[currentAgent] || []).filter(
                            (msg) => msg.sender !== "typing"
                        ),
                        { sender: "agent", text: agentResponse },
                    ],
                }));

                // Add chat message to Firestore
                await addDoc(collection(db, "chats"), {
                    agent: currentAgent,
                    message: agentResponse,
                    tip: tipAmount,
                    timestamp: serverTimestamp(),
                });
            } catch (error) {
                console.error(error);
            }
        } else {
            // For other agents without API, use hardcoded responses
            const fallbackResponse =
                AGENT_RESPONSES[currentAgent]?.[
                    Math.floor(
                        Math.random() * AGENT_RESPONSES[currentAgent].length
                    )
                ] || "I don't have much to say right now.";

            setTimeout(() => {
                setChatHistory((prev) => ({
                    ...prev,
                    [currentAgent]: [
                        ...(prev[currentAgent] || []).filter(
                            (msg) => msg.sender !== "typing"
                        ),
                        { sender: "agent", text: fallbackResponse },
                    ],
                }));
            }, 1500); // Simulate delay for natural response
        }
    };

    const requestMessageSend = async () => {
        if (!address) {
            alert("Wallet Not Connected");
            return;
        }

        // Confirm Tipping Transaction
        const tip = tipAmount ? tipAmount : 0;
        if (tip > 0) {
            if (
                parseInt(allowance ? allowance.toString() : "0") <
                tip * 10 ** 18
            ) {
                await approveToken({
                    ...tokenContractConfig,
                    functionName: "approve",
                    args: [
                        "0x04A951420393160617BfBF0017464E256d4C4468",
                        tip * 5 * 10 ** 18,
                    ],
                });
            } else {
                if(!currentAgent){alert("Agent Not Found");return;}
                await writeContract({
                    ...networkStateContractConfig,
                    functionName: "payAgent",
                    args: [agentData[currentAgent].address, tip * 10 ** 18],
                });
                //handleSendMessage();
            }
        } else {
            handleSendMessage();
        }
    };

    return (
        <div
            className={`fixed top-16 h-full w-md flex flex-col transition-transform ${
                isChatting
                    ? "translate-x-0 right-3"
                    : "translate-x-full right-0"
            }`}
        >
            <Card className="h-full flex flex-col text-black border-0 bg-yellow-50/70 backdrop-blur-lg shadow z-10 mb-[72px]">
                {/* Mini Agent Profile with Close Button */}
                {currentAgent && (
                    <div className="relative">
                        <MiniAgentProfile
                            agentName={currentAgent}
                            agentAddress={
                                agentData[currentAgent].address ||
                                DEFAULT_AGENT_ADDRESS
                            }
                        />
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="absolute top-2 right-2 p-1 text-gray-700 hover:text-black cursor-pointer"
                        >
                            <X className="scale-120" />
                        </Button>
                    </div>
                )}

                {/* Chat Messages */}
                <CardContent className="flex-1 py-0 px-6 overflow-hidden">
                    {/* Currently hardcoded the height*/}
                    <ScrollArea className="h-[72vh] overflow-y-auto flex flex-col gap-2">
                        <div className="flex flex-col max-w-[90%]">
                            {chatHistory[currentAgent!]?.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mx-1 p-2 px-3 rounded-2xl shadow-xs max-w-[75%] my-2 bg-white/95 text-zinc-700 border-0 break-words ${
                                        msg.sender === "user"
                                            ? "shadow-blue-700 self-end text-right"
                                            : "shadow-purple-600 self-start text-left"
                                    }`}
                                >
                                    {msg.sender === "typing" ? (
                                        <TypingIndicator />
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            ))}
                        </div>
                        <div ref={messagesEndRef} />
                    </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="p-3 flex gap-2 text-black">
                    <div className="bg-white/95 flex-1 flex items-center gap-2 rounded-full shadow">
                        <Input
                            ref={inputRef}
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="border-0 focus-visible:ring-0 shadow-none"
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") {
                                    requestMessageSend();
                                }
                            }}
                            onFocus={() => {
                                EventBus.emit("disable-game-input");
                            }}
                            onBlur={() => {
                                EventBus.emit("enable-game-input");
                            }}
                        />
                        <Select
                            onValueChange={(value) =>
                                setTipAmount(Number(value))
                            }
                        >
                            <SelectTrigger className="w-fit bg-white/95 border-0 focus:ring-0 shadow-none rounded-full text-sm text-gray-800">
                                <SelectValue placeholder="Tip 💸" />
                            </SelectTrigger>
                            <SelectContent className="text-gray-800 mr-6 border-0 bg-yellow-200/50 backdrop-blur-lg">
                                {TIP_AMOUNTS.map((amount) => (
                                    <SelectItem
                                        key={amount}
                                        className="transition-colors hover:bg-yellow-100"
                                        value={amount.toString()}
                                    >
                                        {amount}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={requestMessageSend}
                        variant="outline"
                        className="cursor-pointer rounded-full border-0 shadow-none text-blue-500"
                        size="icon"
                        disabled={!message.trim()}
                    >
                        <SendHorizonal size={36} className="scale-125" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}

/**
 * Typing Indicator: Three dots animating up and down smoothly
 */
function TypingIndicator() {
    return (
        <div className="flex space-x-1 p-1">
            <span className="dot-animation bg-gray-400 rounded-full w-1.5 h-1.5"></span>
            <span className="dot-animation bg-gray-400 rounded-full w-1.5 h-1.5 animation-delay-200"></span>
            <span className="dot-animation bg-gray-400 rounded-full w-1.5 h-1.5 animation-delay-400"></span>
            <style jsx>{`
                .dot-animation {
                    animation: bounce 1.4s infinite;
                }
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                @keyframes bounce {
                    0%,
                    80%,
                    100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-5px);
                    }
                }
            `}</style>
        </div>
    );
}