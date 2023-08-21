/* 
    Displays a different button depending if user is subscribed or not.
        User is sent to Stripe Checkout if they're not subscribed
        User is sent to Stripe Dashbaord if they're subscribed
*/
"use client"

import { Zap } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "./ui/button";

interface SubscriptionButtonProps {
    isPro: boolean;
};

export const SubscriptionButton = ({
    isPro = false
}: SubscriptionButtonProps) => {
    const [loading, setLoading] = useState(false);

    const onClick = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/stripe");

            window.location.href = response.data.url;
        } catch (error) {
            toast.error("Something went wrong");    // Billing Error
        } finally {
            setLoading(false);
        }
    }


    return (
        <Button
            disabled={loading} 
            variant={isPro ? "default" : "premium"}
            onClick={onClick}
        >
            {isPro ? "Manage Subscription" : "Upgrade"}
            {!isPro && <Zap className="w-4 h-4 ml-2 fill-white" />}
        </Button>
    )
}