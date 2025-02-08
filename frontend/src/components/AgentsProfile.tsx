import { useAccount, useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { networkStateContractConfig } from '@/utils/wagmiContractConfig';
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
//next/image is not working
//import Image from 'next/image';

import Balance from '@/components/display/Balance';
import { UserAverageFeedback, UserSpending } from '@/components/display/UserInfo';
import { TaskCompleted, TotalSpend, TotalEarned, AverageFeedback} from '@/components/display/AgentInfo';
import { csvToList, truncateAddress, formatNumber} from '@/utils/formatData';

// DEFAULT AGENT ADDRESS
const address = '0x74EF2a3c2CC1446643Ab59e5b65dd86665521F1c';

export default function AgentsProfile(){
    const contractConfig = {
        ...networkStateContractConfig,
        functionName: 'agents',
        args: [address], 
    }
    const {data, error, isPending} = useReadContract(contractConfig);

    function getUserData(data:any){
        return csvToList(data as string);
    }

    function getAverageFeedback(data:any){
        const userData = getUserData(data);
        if(userData[1] as number === 0) return 0;

        return (userData[0] as number) / (userData[1] as number);
    }

    return(
        <>{data && <Card className="w-[700px] max-w-4xl bg-white shadow-lg text-black">
            <CardContent className="flex p-6">
                <div className="flex flex-col items-center space-y-4 pr-6 border-r border-gray-200">
                    <Avatar className="w-32 h-32">
                        <AvatarImage src="/assets/default_character.png" alt="User profile" />
                        <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-muted-foreground text-center">
                        <p className="font-medium">Wallet Address</p>
                        <p>{data?.toString()}</p>
                        <p className="font-mono">{truncateAddress(address?address:"")}</p>
                    </div>
                </div>
                <div className="flex-grow pl-6 space-y-6">
                    <InfoRow label="Token Balance" value={<Balance address={address}/>} icon={<TokenLogo />} />
                    <InfoRow
                        label="Average Feedback"
                        value={data? <AverageFeedback data={data}/>: "Not Found"}
                        icon={<Star className="w-5 h-5 text-yellow-400 fill-current" />}
                    />
                    <InfoRow label="Tasks Completed " value={data? <TaskCompleted data={data} />: "Not Found"} icon={<></>} />
                    {/*<InfoRow label="Total Spent Tokens" value={data? `${formatNumber(Number(getUserData(data)[2]) / 10**18, 2)} - ${getUserData(data)}` : "0.00"} icon={<TokenLogo />} />*/}
                    <InfoRow label="Total Spent " value={data? <TotalSpend data={data} />: "Not Found"} icon={<TokenLogo />} />
                    <InfoRow label="Total Earned " value={data? <TotalEarned data={data} />: "Not Found"} icon={<TokenLogo />} />
                </div>
            </CardContent>
        </Card>}</>);
}

function InfoRow({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-lg font-bold">{value}</span>
        </div>
      </div>
    )
}

function TokenLogo() {
    return (
      <img src="/assets/token.png" alt="Token Logo" className="w-8 h-8" />
    )
}
  