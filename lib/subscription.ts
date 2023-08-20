/* Checks if user has VALID subscription  */
import { auth } from "@clerk/nextjs";

import prismadb from "./prismadb";

const DAY_IN_MS = 86_400_000;   // Day in miliseconds CONSTANT VARIABLE

export const checkSubscription = async () => {
    const { userId } = auth();

    if (!userId) {  // No userId = No subscription
        return false;
    }

    // Find user subscription and returns true for Stripe variables
    const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
            userId: userId
        },
        select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
        },
    });

    if (!userSubscription) {    // No userSubscription
        return false;
    }

    // Checks if subscription is valid
    const isValid = 
        userSubscription.stripePriceId &&
        userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();
    return !!isValid;
}