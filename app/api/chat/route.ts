import { NextResponse } from 'next/server';
import {chain} from "@/utils/chain";
import {Message} from "@/types/message";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { chats, messages as _messages } from "@/lib/db/schema";
import { text } from 'stream/consumers';
import { querystring } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';



export async function POST(request: Request) {
  
    const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
            const body = await request.json();
            const question: string = body.query;
            const history: Message[] = body.history ?? []

            const res = await chain.call({
                    question: question,
                    chat_history: history.map(h => h.content).join("\n"),
                });
                console.log(res.sourceDocuments)
                
                await db.insert(_messages).values({ 
                    content:  question,
                    role: "user",
                    userId
                  })
        
                await db.insert(_messages).values({ 
                    content:  res.text,
                    role: "system",
                    userId
                  })
        
                    
                  
            
            // Remove in-text citations like [1], [2], etc.
            //let cleanedText = res.text.replace(/\[\d+\]/g, '');

            // Remove the word "Wikipedia"
            //cleanedText = cleanedText.replace(/Wikipedia/g, '');

            interface Document {
              metadata: {
                  source: string;
                  page: string; // or number, depending on what type 'page' is
              };
          }
          
               
          const links = Array.from(new Set(res.sourceDocuments.map((document: Document) => {
            return document.metadata.source + " Page:" + document.metadata.page;
        })));
        return NextResponse.json({role: "assistant", content: res.text, links: links});
        
          
        }

        catch (error) {
            console.error(error);
            return NextResponse.json(
              { error: "internal server error" },
              { status: 500 } )}}