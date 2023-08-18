/*
Backend
- Allows user to view their billing portal (Stripe)
- After user is done, they will be transported back to /settings
*/
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings") // calls localhost:3000/settings

export async function GET() {
    try {
        const { userId } = auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        } 

        const userSubscription = await prismadb.userSubscription.findUnique({ // find unique ID in prisma
            where: {
                userId
            }
        });

        if (userSubscription && userSubscription.stripeCustomerId) { // if there are subscriptions in Prisma and Stripe
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                return_url: settingsUrl,
            });

            return new NextResponse(JSON.stringify({ url: stripeSession.url }));
        }

        // user checking out
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.emailAddresses[0].emailAddress, // Extracted from Clerk
            line_items: [
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "Tonovo Pro",
                            description: "Unlimited AI Generations",
                        },
                        unit_amount: 2000, // 20 USD
                        recurring: {
                            interval: "month",
                        }
                    },
                    quantity: 1,
                }
            ],
            metadata: { // connects subscription to the userId
                userId,
            },
        });

        return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    } catch (error) {
        console.log("[STRIPE_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}