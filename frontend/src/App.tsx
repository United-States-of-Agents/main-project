"use client";

import { useRef, useState, useEffect } from "react";
import { type IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { ChatInterface } from "./components/ChatInterface";
import { EventBus } from "./game/EventBus";
import { ConnectButton } from "@/components/connection/ConnectWallet";
import Provider from "@/components/connection/WagmiProvider";
import UserProfile from "@/components/UserProfile";
import { ControlGuide } from "./components/ControlGuide";


function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [isChatting, setIsChatting] = useState(false);
    const [currentAgent, setCurrentAgent] = useState<string | null>(null);

    useEffect(() => {
        const handleAgentInteraction = (agentId: string) => {
            setCurrentAgent(agentId);
            setIsChatting(true);
        };

        EventBus.on("agent-interaction", handleAgentInteraction);

        return () => {
            EventBus.off("agent-interaction", handleAgentInteraction);
        };
    }, []);

    const handleCloseChat = () => {
        setIsChatting(false);
        setCurrentAgent(null);

        // Ensure Phaser knows chat is closed
        EventBus.emit("chat-closed");

        // Reset 'E' key state
        if (phaserRef.current) {
            const scene = phaserRef.current.scene;
            if (scene) {
                const game = phaserRef.current.game;
                game!.input.keyboard!.enabled = true;
                scene.input.keyboard?.removeCapture("E");
            }
        }
    };

    return (
        <Provider>
            <div id="app" className="relative w-full h-screen">
                <PhaserGame ref={phaserRef} />
                <ControlGuide />
                <ChatInterface
                    isChatting={isChatting}
                    currentAgent={currentAgent}
                    onClose={handleCloseChat}
                />
                <UserProfile />
                <ConnectButton />
            </div>
        </Provider>
    );
}

export default App;
