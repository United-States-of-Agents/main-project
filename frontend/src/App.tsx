import { useRef, useState, useEffect } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { ChatInterface } from "./components/ChatInterface";
import { EventBus } from "./game/EventBus";

import {
    WalletOptions,
    ConnectButton,
} from "@/components/connection/ConnectWallet";
import Provider from "@/components/connection/WagmiProvider";
import UserProfile from "@/components/UserProfile";
import AgentsProfile from "@/components/AgentsProfile";
import PayAgent from "@/components/agents/PayAgent";
import CreateAgent from "@/components/agents/CreateAgent";
import AcceptTask from "@/components/agents/AcceptTask";
import AddReview from "@/components/agents/AddReview";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [isChatting, setIsChatting] = useState(false);

    useEffect(() => {
        EventBus.on("agent-interaction", () => {
            setIsChatting(true);
        });

        return () => {
            EventBus.off("agent-interaction");
        };
    }, []);

    const handleCloseChat = () => {
        setIsChatting(false);

        // Reset the 'E' key state in Phaser
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
                <ChatInterface
                    isChatting={isChatting}
                    onClose={handleCloseChat}
                />
                <UserProfile />
                <AgentsProfile />
                <ConnectButton />

                {/* #TODO: Web3 Connections For Navbar Here */}
                <div className="w-screen/2 h-screen bg-black mt-20">
                    <AcceptTask />
                    <PayAgent />
                    <CreateAgent />
                    <AddReview />
                </div>
            </div>
        </Provider>
    );
}

export default App;
