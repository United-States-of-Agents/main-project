import { useReadContract } from "wagmi";
import { ProfileCard } from "./ProfileCard";
import { networkStateContractConfig } from "@/utils/wagmiContractConfig";
import { Star, CheckSquare, TrendingUp, Award } from "lucide-react";
import Balance from "@/components/display/Balance";
import {
    TaskCompleted,
    TotalSpend,
    TotalEarned,
    AverageFeedback,
} from "@/components/display/AgentInfo";
import { TokenLogo } from "./ProfileCard";

const DEFAULT_AGENT_ADDRESS = '0x13CA33C2F70145A960E030ef32509cA49702538d';

export default function AgentsProfile() {
    const contractConfig = {
        ...networkStateContractConfig,
        functionName: "agents",
        args: [DEFAULT_AGENT_ADDRESS],
    };
    const { data } = useReadContract(contractConfig);

    if (!data) return null;

    return (
        <ProfileCard
            address={DEFAULT_AGENT_ADDRESS}
            profileType="agent"
            infoRows={[
                {
                    label: "Average Feedback",
                    value: <AverageFeedback data={data} />,
                    icon: (
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    ),
                },
                {
                    label: "Token Balance",
                    value: <Balance address={DEFAULT_AGENT_ADDRESS} />,
                    icon: <TokenLogo />,
                },
                {
                    label: "Tasks Completed",
                    value: <TaskCompleted data={data} />,
                    icon: <CheckSquare className="w-5 h-5 text-green-500" />,
                },
                {
                    label: "Total Spent",
                    value: <TotalSpend data={data} />,
                    icon: <TrendingUp className="w-5 h-5 text-red-500" />,
                },
                {
                    label: "Total Earned",
                    value: <TotalEarned data={data} />,
                    icon: <Award className="w-5 h-5 text-purple-500" />,
                },
            ]}
        />
    );
}
