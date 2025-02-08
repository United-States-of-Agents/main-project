import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { truncateAddress } from "@/utils/formatData";

interface InfoRowProps {
    label: string;
    value: any;
    icon?: React.ReactNode;
}

interface ProfileCardProps {
    address: string;
    data: any;
    profileType: "user" | "agent"; // Determines different fields
    infoRows: InfoRowProps[];
}

export function ProfileCard({
    address,
    data,
    profileType,
    infoRows,
}: ProfileCardProps) {
    return (
        <Card
            className={`fixed ${
                profileType === "user" ? "left-2 bottom-2" : "top-2 left-2"
            } bg-yellow-50/70 backdrop-blur-md shadow-xl text-black border-0`}
        >
            <CardContent className="flex p-4">
                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center space-y-4 pr-4 border-r border-white/50">
                    <Avatar className="w-16 h-16">
                        <AvatarImage
                            src="/assets/default_character.png"
                            alt="User profile"
                        />
                        <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-muted-foreground text-center bg-gray-400 px-2 py-1 rounded-full">
                        <p className="font-mono">{truncateAddress(address)}</p>
                    </div>
                </div>

                {/* Dynamic Info Section */}
                <div className="flex-grow pl-4 space-y-3">
                    {infoRows.map((row, index) => (
                        <InfoRow
                            key={index}
                            label={row.label}
                            value={row.value}
                            icon={row.icon}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
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

export function TokenLogo() {
    return <img src="/assets/token.png" alt="Token Logo" className="w-6 h-6" />;
}
