import { useAccount, useReadContract } from "wagmi";
import { ProfileCard } from "./ProfileCard";
import { networkStateContractConfig } from "@/utils/wagmiContractConfig";
import { Star, Wallet } from "lucide-react";
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
            profileType="user"
            avatarImageURL="/assets/player_avatar.png"
            infoRows={[
                {
                    label: "Average Feedback",
                    value: <UserAverageFeedback data={data} />,
                    icon: (
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    ),
                },
                {
                    label: "Token Balance",
                    value: <Balance address={address || ""} />,
                    icon: <TokenLogo />,
                },
                {
                    label: "Total Spent",
                    value: <UserSpending data={data} />,
                    icon: <Wallet className="w-5 h-5 text-blue-500" />,
                },
            ]}
        />
    );
}
