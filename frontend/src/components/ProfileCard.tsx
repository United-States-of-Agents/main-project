import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { truncateAddress } from "@/utils/formatData";
import type React from "react";

interface InfoRowProps {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
}

interface ProfileCardProps {
    address: string;
    data: any;
    profileType: "user" | "agent";
    infoRows: InfoRowProps[];
}

export function ProfileCard({
    address,
    data,
    profileType,
    infoRows,
}: ProfileCardProps) {
    const feedbackRow = infoRows.find(
        (row) => row.label === "Average Feedback"
    );
    const otherRows = infoRows.filter(
        (row) => row.label !== "Average Feedback"
    );

    return (
        <Card
            className={`fixed ${
                profileType === "user" ? "left-2 bottom-2" : "top-2 left-2"
            } bg-yellow-50/70 backdrop-blur-md shadow-xl text-black border-0 w-72`}
        >
            <CardContent className="p-6">
                <div className="flex flex-col items-center mb-4">
                    <Avatar className="w-24 h-24">
                        <AvatarImage
                            src="/assets/default_character.png"
                            alt="User profile"
                        />
                        <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    {feedbackRow && (
                        <div className="flex items-center space-x-2 bg-yellow-100 rounded-full px-3 py-1 -mt-3 z-10">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-lg font-bold">
                                {feedbackRow.value}
                            </span>
                        </div>
                    )}
                    <div className="text-sm text-muted-foreground text-center bg-gray-400 px-3 py-1 rounded-full my-2">
                        <p className="font-mono">{truncateAddress(address)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {otherRows.map((row, index) => (
                        <InfoBox key={index} {...row} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function InfoBox({ label, value, icon }: InfoRowProps) {
    return (
        <div className="bg-white/50 rounded-lg p-3 flex flex-col items-center justify-center">
            <div className="text-xs font-medium mb-1 truncate w-full text-center">
                {label}
            </div>
            <div className="flex items-center space-x-1">
                {icon}
                <span className="text-lg font-bold">{value}</span>
            </div>
        </div>
    );
}

export function TokenLogo() {
    return <img src="/assets/token.png" alt="Token Logo" className="w-6 h-6" />;
}
