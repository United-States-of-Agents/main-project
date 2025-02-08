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
    profileType: "user" | "agent";
    infoRows: InfoRowProps[];
    avatarImageURL?: string;
}

export function ProfileCard({
    address,
    infoRows,
    avatarImageURL,
}: ProfileCardProps) {
    const feedbackRow = infoRows.find(
        (row) => row.label === "Average Feedback"
    );
    const otherRows = infoRows.filter(
        (row) => row.label !== "Average Feedback"
    );

    return (
        <Card className="fixed left-3 bottom-3 bg-yellow-50/80 backdrop-blur-xl shadow-xl text-black border-0 rounded-xl overflow-hidden">
            <CardContent className="p-5 flex items-center space-x-3">
                <div className="space-y-4">
                    {/* Avatar & Rating */}
                    <div className="relative flex flex-col items-center">
                        <Avatar className="w-20 h-20 border-2 border-white shadow-md">
                            <AvatarImage
                                src={
                                    avatarImageURL ||
                                    "/assets/default_character.png"
                                }
                                alt="User profile"
                            />
                            <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                        {feedbackRow && (
                            <div className="absolute -bottom-2 flex items-center bg-yellow-200 rounded-full px-2 py-0.5 shadow">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-bold ml-1">
                                    {feedbackRow.value}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Wallet Address */}
                    <div className="bg-gray-300 px-3 py-1 rounded-full text-xs font-mono shadow">
                        {truncateAddress(address)}
                    </div>
                </div>

                {/* Stats Grid (Balanced Layout) */}
                <div className="w-full space-y-2">
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
        <div className="flex flex-col items-center bg-white/60 rounded-md p-2 shadow-sm transition-all hover:bg-white/80 hover:shadow-md w-full">
            <div className="flex items-center justify-center space-x-1 text-xs font-semibold text-gray-700 w-full">
                {icon}
                <span className="max-w-full text-center">{label}</span>
            </div>
            <span className="text-sm font-bold mt-1">{value}</span>
        </div>
    );
}

export function TokenLogo() {
    return <img src="/assets/token.png" alt="Token Logo" className="w-5 h-5" />;
}
