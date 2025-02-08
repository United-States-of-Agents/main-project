import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventBus } from "../game/EventBus";
import { SendHorizonal, X } from "lucide-react";
import { MiniAgentProfile } from "./MiniAgentProfile";

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
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        // If chatting with Sara, use OpenAI API
        if (currentAgent === "Sara") {
            try {
                const response = await fetch("/api/agent-response", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        agentName: currentAgent,
                        userMessage: message,
                    }),
                });

                const data = await response.json();

                setChatHistory((prev) => ({
                    ...prev,
                    [currentAgent]: [
                        ...(prev[currentAgent] || []).filter(
                            (msg) => msg.sender !== "typing"
                        ),
                        { sender: "agent", text: data.response },
                    ],
                }));
            } catch (error) {
                console.error("Error fetching agent response:", error);
            }
        } else {
            // For other agents, use predefined responses
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

    return (
        <div
            className={`fixed top-16 h-full w-md flex flex-col transition-transform ${
                isChatting
                    ? "translate-x-0 right-4"
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
                                "0x74EF2a3c2CC1446643Ab59e5b65dd86665521F1c"
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
                        <div className="flex flex-col">
                            {chatHistory[currentAgent!]?.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mx-1 p-2 px-3 rounded-2xl shadow-xs max-w-[75%] my-2 bg-white/95 text-zinc-700 border-0 ${
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
                    <Input
                        ref={inputRef}
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-white/95 border-0 shadow rounded-full focus-visible:ring-0"
                        onKeyDown={(e) => e.stopPropagation()}
                        onFocus={() => {
                            EventBus.emit("disable-game-input");
                        }}
                        onBlur={() => {
                            EventBus.emit("enable-game-input");
                        }}
                    />
                    <Button
                        onClick={handleSendMessage}
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
