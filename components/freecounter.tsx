"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "./ui/card";

// Allows FreeCounter to take in apiLimitCount
interface FreeCounterProps {
    apiLimitCount: number;
}

export const FreeCounter = ({
    apiLimitCount = 0
}: FreeCounterProps) => {
    // Trick to prevent hydration errors
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true)
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="px-3">
            <Card className="bg-white/10 border-0">
                <CardContent className="py-6">
                    <div className="text-center text-sm text-white mb-4 space-y-2">
                        <p>
                        {apiLimitCount}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}