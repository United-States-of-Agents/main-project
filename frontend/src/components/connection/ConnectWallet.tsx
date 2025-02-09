import * as React from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/utils/formatData";
import { Wallet, LogOut } from "lucide-react";

export function ConnectButton() {
    const { connectors, connect } = useConnect();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    return (
        <div className="fixed top-3 right-3">
            <Button
                className="flex items-center gap-2 px-5 py-5 text-lg font-semibold rounded-full shadow-lg bg-gradient-to-r from-yellow-100 to-yellow-200 text-black transition-shadow hover:shadow-xl cursor-pointer"
                onClick={() =>
                    address
                        ? disconnect()
                        : connect({ connector: connectors[1] })
                }
            >
                {address ? (
                    <>
                        <LogOut size={20} className="text-red-600" />
                        <span>{truncateAddress(address)}</span>
                    </>
                ) : (
                    <>
                        <Wallet size={20} className="text-blue-600" />
                        <span>Connect Wallet</span>
                    </>
                )}
            </Button>
        </div>
    );
}
