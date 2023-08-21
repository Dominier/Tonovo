/* Crisp Chat Feature */
"use client"

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("ce48e16a-3de1-40f4-ae93-42c3287bfb9b");
    }, []);

    return null;
}