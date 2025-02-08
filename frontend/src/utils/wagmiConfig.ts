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
        [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/CIy2ezuBM2p9iHPNXw1jN_SMRelF4Gmq"),
    },
});