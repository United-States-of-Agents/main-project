import { useAccount, useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import { networkStateContractConfig } from "@/utils/wagmiContractConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
//next/image is not working
//import Image from 'next/image';

import Balance from "@/components/display/Balance";
import {
    UserAverageFeedback,
    UserSpending,
} from "@/components/display/UserInfo";
import { csvToList, truncateAddress, formatNumber } from "@/utils/formatData";

export default function UserProfile() {
    const { address } = useAccount();
    const contractConfig = {
        ...networkStateContractConfig,
        functionName: "users",
        args: [address], // Replace with the wallet address you want to query
    };
    const { data, error, isPending } = useReadContract(contractConfig);

    function getUserData(data: any) {
        return csvToList(data as string);
    }

    function getAverageFeedback(data: any) {
        const userData = getUserData(data);
        if ((userData[1] as number) === 0) return 0;

        return (userData[0] as number) / (userData[1] as number);
    }

    if (!data) {
        return null;
    }

    return (
        <Card className="fixed left-2 bottom-2 bg-yellow-50/70 backdrop-blur-md shadow-xl text-black border-0">
            <CardContent className="flex p-4">
                <div className="flex flex-col items-center justify-center space-y-4 pr-4 border-r border-white/50">
                    <Avatar className="w-16 h-16">
                        <AvatarImage
                            src="/assets/default_character.png"
                            alt="User profile"
                        />
                        <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-muted-foreground text-center bg-gray-400 px-2 py-1 rounded-full">
                        {/*<p>{data?.toString()}</p>*/}
                        <p className="font-mono">
                            {truncateAddress(address ? address : "")}
                        </p>
                    </div>
                </div>
                <div className="flex-grow pl-4 space-y-4">
                    <InfoRow
                        label="Token Balance"
                        value={<Balance address={address} />}
                        icon={<TokenLogo />}
                    />
                    {/*<InfoRow label="Total Spent Tokens" value={data? `${formatNumber(Number(getUserData(data)[2]) / 10**18, 2)} - ${getUserData(data)}` : "0.00"} icon={<TokenLogo />} />*/}
                    <InfoRow
                        label="Total Spent Tokens"
                        value={
                            data ? <UserSpending data={data} /> : "Not Found"
                        }
                        icon={<TokenLogo />}
                    />
                    <InfoRow
                        label="Average Feedback"
                        value={
                            data ? (
                                <UserAverageFeedback data={data} />
                            ) : (
                                "Not Found"
                            )
                        }
                        icon={
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        }
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: any;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex justify-between items-center gap-3">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex items-center space-x-1">
                {icon}
                <span className="text-lg font-bold">{value}</span>
            </div>
        </div>
    );
}

function TokenLogo() {
    return <img src="/assets/token.png" alt="Token Logo" className="w-6 h-6" />;
}
