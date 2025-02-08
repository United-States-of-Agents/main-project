import { useState } from "react";
import { useReadContract } from "wagmi";
import { networkStateContractConfig } from "@/utils/wagmiContractConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Star,
    CheckSquare,
    TrendingUp,
    Award,
    Copy,
    Check,
} from "lucide-react";
import { truncateAddress } from "@/utils/formatData";
import {
    AverageFeedback,
    TaskCompleted,
    TotalSpend,
    TotalEarned,
} from "@/components/display/AgentInfo";
import Balance from "@/components/display/Balance";
import { TokenLogo } from "./ProfileCard";

export function MiniAgentProfile({
    agentName,
    agentAddress,
}: {
    agentName: string;
    agentAddress: string;
}) {
    const [copied, setCopied] = useState(false);
    const contractConfig = {
        ...networkStateContractConfig,
        functionName: "agents",
        args: [agentAddress],
    };

    const { data } = useReadContract(contractConfig);

    const handleCopy = () => {
        navigator.clipboard.writeText(agentAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <div className="flex flex-col p-3 bg-yellow-100 rounded-xl shadow-md">
            {/* Name, Address, and Rating */}
            <div className="flex items-center space-x-3">
                {/* Avatar */}
                <Avatar className="w-12 h-12 border-2 border-yellow-500 shadow-md">
                    <AvatarImage
                        src={`/assets/${agentName.toLowerCase()}_avatar.png`}
                    />
                    <AvatarFallback>AG</AvatarFallback>
                </Avatar>

                {/* Name & Address */}
                <div className="flex-1">
                    <p className="font-semibold leading-tight text-lg">
                        {agentName}
                    </p>
                    <div className="flex items-center space-x-1">
                        <p className="text-sm text-gray-500">
                            {truncateAddress(agentAddress)}
                        </p>
                        <button
                            onClick={handleCopy}
                            className="text-gray-500 transition-colors hover:text-black pl-0.5"
                        >
                            {copied ? (
                                <Check size={14} className="text-green-500" />
                            ) : (
                                <Copy size={14} className="cursor-pointer" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mr-7 bg-yellow-200 rounded-full px-3 py-1.5">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold">
                        <AverageFeedback data={data} />
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-between items-center mt-5 mx-4 text-xs text-gray-700">
                <Stat
                    label="Balance"
                    value={<Balance address={agentAddress} />}
                    icon={<TokenLogo />}
                />
                <Stat
                    label="Tasks"
                    value={<TaskCompleted data={data} />}
                    icon={<CheckSquare className="w-4 h-4 text-green-500" />}
                />
                <Stat
                    label="Spent"
                    value={<TotalSpend data={data} />}
                    icon={<TrendingUp className="w-4 h-4 text-red-500" />}
                />
                <Stat
                    label="Earned"
                    value={<TotalEarned data={data} />}
                    icon={<Award className="w-4 h-4 text-purple-500" />}
                />
            </div>
        </div>
    );
}

function Stat({
    label,
    value,
    icon,
}: {
    label: string;
    value: any;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center">
            {icon}
            <span className="font-bold">{value}</span>
            <span className="text-[10px]">{label}</span>
        </div>
    );
}
