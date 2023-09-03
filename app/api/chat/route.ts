import { NextResponse } from 'next/server';
import {chain} from "@/utils/chain";
import {Message} from "@/types/message";

export async function POST(request: Request) {

    const body = await request.json();
    const question: string = body.query;
    const history: Message[] = body.history ?? []

    const res = await chain.call({
            question: question,
            chat_history: history.map(h => h.content).join("\n"),
        });

   

    
    // Remove in-text citations like [1], [2], etc.
    let cleanedText = res.text.replace(/\[\d+\]/g, '');

    // Remove the word "Wikipedia"
    cleanedText = cleanedText.replace(/Wikipedia/g, '');




    return NextResponse.json({role: "assistant", content: res.text});
}
