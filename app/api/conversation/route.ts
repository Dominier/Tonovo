// Connection to OpenAI API for Conversation
// Connection to custom API Limit library

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(
    req: Request
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { messages } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!configuration.apiKey) {
            return new NextResponse("OpenAI API Key not configured", { status: 500 });
        }

        if (!messages) {
            return new NextResponse("Messages are required", { status: 400 });
        }

        const freeTrial = await checkApiLimit();    // retrieves free trial status
        const isPro = await checkSubscription();    // retrieves pro status

        if (!freeTrial && !isPro) {   // checks for free trial & pro status; status of 403 will enable Pro-Modal
            return new NextResponse("Free trial has expired.", { status: 403 });
        }

        const response = await openai.createChatCompletion({
            model: "gpt-4-1106-preview",
            messages
        });

        if (!isPro) {
            await increaseApiLimit();   // Increase API Limit counter after usage
        }

        return NextResponse.json(response.data.choices[0].message);
    } catch (error) {
        console.log("[CONVERSATION_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 });
    }
}