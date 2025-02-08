import { useAccount, useReadContract } from "wagmi";
import { ProfileCard } from "./ProfileCard";
import { networkStateContractConfig } from "@/utils/wagmiContractConfig";
import { Star } from "lucide-react";
import Balance from "@/components/display/Balance";
import {
    UserAverageFeedback,
    UserSpending,
} from "@/components/display/UserInfo";
import { TokenLogo } from "./ProfileCard";

export default function UserProfile() {
    const { address } = useAccount();
    const contractConfig = {
        ...networkStateContractConfig,
        functionName: "users",
        args: [address],
    };
    const { data } = useReadContract(contractConfig);

    if (!data) return null;

    return (
        <ProfileCard
            address={address || ""}
            data={data}
            profileType="user"
            infoRows={[
                {
                    label: "Token Balance",
                    value: <Balance address={address} />,
                    icon: <TokenLogo />,
                },
                {
                    label: "Total Spent Tokens",
                    value: <UserSpending data={data} />,
                    icon: <TokenLogo />,
                },
                {
                    label: "Average Feedback",
                    value: <UserAverageFeedback data={data} />,
                    icon: (
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    ),
                },
            ]}
        />
    );
}
