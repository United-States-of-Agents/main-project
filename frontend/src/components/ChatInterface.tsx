import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventBus } from "../game/EventBus";
import { SendHorizonal, X } from "lucide-react";
import { MiniAgentProfile } from "./MiniAgentProfile";

const agentAddress = "0x74EF2a3c2CC1446643Ab59e5b65dd86665521F1c";

type ChatMessage = { sender: "user" | "agent"; text: string };

export function ChatInterface({
    isChatting,
    onClose,
}: {
    isChatting: boolean;
    onClose: () => void;
}) {
    const [chatHistory, setChatHistory] = useState<
        Record<string, ChatMessage[]>
    >({});
    const [message, setMessage] = useState("");
    const [currentAgent, setCurrentAgent] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        EventBus.on("agent-interaction", (agentId: string) => {
            setCurrentAgent(agentId);
            setChatHistory((prev) => ({
                ...prev,
                [agentId]: prev[agentId] || [],
            }));

            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        });

        EventBus.on(
            "agent-message",
            ({ agentId, text }: { agentId: string; text: string }) => {
                setChatHistory((prev) => ({
                    ...prev,
                    [agentId]: [
                        ...(prev[agentId] || []),
                        { sender: "agent", text },
                    ],
                }));
            }
        );

        return () => {
            EventBus.off("agent-interaction");
            EventBus.off("agent-message");
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    useEffect(() => {
        // Listen for Escape key to close chat
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleCloseChat();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSendMessage = () => {
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
    };

    const handleCloseChat = () => {
        setCurrentAgent(null);
        onClose();
        EventBus.emit("chat-closed");
    };

    return (
        <div
            className={`fixed top-14 h-full w-md flex flex-col transition-transform ${
                isChatting
                    ? "translate-x-0 right-2"
                    : "translate-x-full right-0"
            }`}
        >
            <Card className="h-full flex flex-col text-black border-0 bg-yellow-50/70 backdrop-blur-lg shadow-lg mb-16">
                {/* Header with Close Button */}
                <CardHeader className="flex items-center justify-between p-3">
                    <span className="text-lg font-semibold">Chat</span>
                    <Button
                        variant="ghost"
                        onClick={handleCloseChat}
                        className="text-xl cursor-pointer"
                    >
                        <X />
                    </Button>
                </CardHeader>

                {/* Mini Agent Profile */}
                {currentAgent && (
                    <MiniAgentProfile
                        agentName={currentAgent}
                        agentAddress={agentAddress}
                    />
                )}

                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-[400px] overflow-y-auto py-2 flex flex-col gap-2">
                        <div className="flex flex-col">
                            {chatHistory[currentAgent!]?.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mx-1 p-2 px-3 rounded-2xl shadow-xs max-w-[75%] my-2 bg-white/95 text-zinc-700 border-0  ${
                                        msg.sender === "user"
                                            ? "shadow-blue-700 self-end text-right"
                                            : "shadow-purple-600 self-start text-left"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <div ref={messagesEndRef} />
                    </ScrollArea>
                </CardContent>
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
