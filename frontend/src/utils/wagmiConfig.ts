import {
    createConfig,
    WagmiProvider,
} from 'wagmi';
import { http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
    chains: [baseSepolia],
    multiInjectedProviderDiscovery: false,
    connectors: [
        injected(),
        //walletConnect({ projectId }),
        metaMask(),
        safe(),
    ],
    transports: {
        [baseSepolia.id]: http(),
    },
});