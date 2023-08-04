// Connection to OpenAI API for Code Generation
// Connection to custom API Limit library

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const instructionMessage: ChatCompletionRequestMessage = {
    role: "system",
    content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
}

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
        
        if (!freeTrial) {   // checks for free trial; status of 403 will enable Pro-Modal
            return new NextResponse("Free trial has expired.", { status: 403 });
        }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [instructionMessage, ...messages],
            temperature: 0.3,   // Changes the creativity of the AI, LOW TEMP FOR CODE
            // top_p: 0.1,      // Changes the sampling, LOW TOP_P FOR CODE (DO NOT UNCOMMENT UNLESS YOU COMMENT TEMP)
        });

        await increaseApiLimit();   // Increase API Limit counter after usage

        return NextResponse.json(response.data.choices[0].message);
    } catch (error) {
        console.log("[CODE_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 });
    }
}