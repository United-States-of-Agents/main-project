import { useReadContract } from "wagmi";
import { networkStateContractConfig } from "@/utils/wagmiContractConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckSquare, TrendingUp, Award } from "lucide-react";
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
    const contractConfig = {
        ...networkStateContractConfig,
        functionName: "agents",
        args: [agentAddress],
    };

    const { data } = useReadContract(contractConfig);

    return (
        <div className="flex flex-col p-3 bg-yellow-100 rounded-t-md shadow-md">
            {/* Name, Address, and Rating */}
            <div className="flex items-center space-x-3">
                {/* Avatar */}
                <Avatar className="w-10 h-10">
                    <AvatarImage src="/assets/default_character.png" />
                    <AvatarFallback>AG</AvatarFallback>
                </Avatar>

                {/* Name & Address */}
                <div className="flex-1">
                    <p className="text-sm font-semibold leading-tight">
                        {agentName}
                    </p>
                    <p className="text-xs text-gray-500">
                        {truncateAddress(agentAddress)}
                    </p>
                </div>

                {/* Rating */}
                <div className="flex items-center text-yellow-500 space-x-1 mr-8">
                    <Star className="w-5 h-5" />
                    <span className="text-lg font-bold">
                        <AverageFeedback data={data} />
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-between items-center mt-4 mx-4 text-xs text-gray-700">
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
