import * as React from "react";
import { Connector, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

export function WalletOptions() {
    const { connectors, connect } = useConnect();

    return (
        <div className="flex flex-col space-y-4 font-semibold">
            {connectors.map((connector) => (
                <button
                    className="bg-white px-8 py-2 text-black rounded-lg"
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                >
                    {connector.name}
                </button>
            ))}
        </div>
    );
}

export function ConnectButton() {
    const { connectors, connect } = useConnect();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    return (
        <div className="fixed top-2 right-2">
            <Button
                className="w-full bg-yellow-50/70 text-lg text-black cursor-pointer rounded-full backdrop-blur-md shadow"
                onClick={() =>
                    address
                        ? disconnect()
                        : connect({ connector: connectors[1] })
                }
            >
                {address ? "Disconnect" : "Connect Wallet"}
            </Button>
        </div>
    );
}
