import { useContractReads } from "wagmi";
import { tokenContractConfig } from "@/utils/wagmiContractConfig";

export default function Balance({ address }: { address: string }) {
    const contractConfig = {
        ...tokenContractConfig,
        functionName: "balanceOf",
        args: [address],
    };
    const { data, error, isPending } = useContractReads({
        contracts: [contractConfig as any],
    });

    if (isPending) {
        return "Loading...";
    }
    if (error) {
        return "Not Found";
    }

    const balance = Number(data?.[0]?.result) / 10 ** 18;
    return formatLargeNumber(balance);
}

function formatLargeNumber(num: number): string {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + "B";
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toFixed(0);
}
