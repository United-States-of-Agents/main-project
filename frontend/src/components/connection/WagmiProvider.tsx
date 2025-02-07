"use client";
import { WagmiProvider} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from "react";
import { config } from "@/utils/wagmiConfig";

const queryClient = new QueryClient();

export default function Provider({children}: {children: ReactNode}){
    return(
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
                {children}
            </WagmiProvider>
        </QueryClientProvider>
    )
}