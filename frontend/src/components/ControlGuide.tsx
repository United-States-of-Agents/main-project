import type React from "react";
import { Zap, X } from "lucide-react";
import { useState } from "react";

export const ControlGuide: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="fixed top-3 left-3 bg-yellow-50/70 backdrop-blur-md p-4 rounded-lg shadow-md text-black w-56">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Controls</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-600 hover:text-black transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>
            <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        {["W", "A", "S", "D"].map((key) => (
                            <kbd
                                key={key}
                                className="px-2 py-1 bg-white/50 rounded shadow"
                            >
                                {key}
                            </kbd>
                        ))}
                    </div>
                    <span>Move</span>
                </div>
                <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-white/50 rounded shadow flex items-center">
                        <Zap size={12} className="mr-1" />
                        Shift
                    </kbd>
                    <span>Run</span>
                </div>
                <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-white/50 rounded shadow">
                        E
                    </kbd>
                    <span>Interact with Agents</span>
                </div>
            </div>
        </div>
    );
};
