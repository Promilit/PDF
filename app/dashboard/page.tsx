"use client";
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/message";
import { Send, LogIn } from "react-feather";
import LoadingDots from "@/components/LoadingDots";
import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axios from "axios";
import SubscriptionButton from "@/components/SubscriptionButton";
import { db } from "@/lib/db/index";
import { chats, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkSubscription } from "@/lib/subscription";
import { DrizzleChat } from "@/lib/db/schema";
import { useUser } from "@clerk/nextjs";





export default function dashboard() {
 


  const [message, setMessage] = useState<string>("");
  const [history, setHistory] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! Ask me anything you want to know.",
    },
  ]);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const handleClick = () => {
    if (message == "") return;
    setHistory((oldHistory) => [
      ...oldHistory,
      { role: "user", content: message },
    ]);
    setMessage("");
    setLoading(true);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: message, history: history }),
    })
      .then(async (res) => {
        const r = await res.json();
        setHistory((oldHistory) => [...oldHistory, r]);
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
      });
  };

  const formatPageName = (url: string) => {
    // Split the URL by "/" and get the last segment
    const pageName = url.split("/").pop();

    // Split by "-" and then join with space
    if (pageName) {
      const formattedName = pageName.split("-").join(" ");

      // Capitalize only the first letter of the entire string
      return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    }
  };

  //scroll to bottom of chat
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <main className="h-screen bg-[url('/images/plenty_balls.png')] bg-cover bg-center p-6 flex flex-col">  
      <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full">
        <div className= "flex items-center gap-10">
        <h1 className="text-5xl font-bold text-transparent  bg-clip-text bg-gradient-to-r from-white to-slate-50">
          Football History Hub
        </h1>
        <UserButton afterSignOutUrl="/" />


        </div>


        <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full">
          <form
            className="rounded-2xl border-purple-700 border-opacity-5  border lg:w-11/12 flex-grow flex flex-col bg-[url('/images/mikidigi_football_white_and_red_blur_on_a_white_background_in_t_a3841b1d-1d24-4648-adb3-7c3d237b1b36.png')] bg-cover bg-center max-h-96 overflow-clip"
            onSubmit={(e) => {
              e.preventDefault();
              handleClick();
            }}
          >
          
        
          <div className="overflow-y-scroll flex flex-col gap-5 p-10 h-full">
            {history.map((message: Message, idx) => {
              const isLastMessage = idx === history.length -1;
              switch (message.role) {
                case "assistant":
                  return (
                    <div
                      ref={isLastMessage ? lastMessageRef : null}
                      key={idx}
                      className="flex gap-2"
                    >
                      <img
                        src="/images/football bot.png"
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-2 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                        <p className="text-sm font-medium text-red-700 mb-2">
                          AI assistant
                        </p>
                        {message.content}
                        {message.links && (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500">
                              Sources:
                            </p>

                            {message.links?.map((link) => {
                              return (
                                <a
                                  href={link}
                                  key={link}
                                  className="block w-fit px-2 py-1 text-sm  text-red-700 bg-violet-100 rounded"
                                >
                                  {formatPageName(link)}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                case "user":
                  return (
                    <div
                      className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tl-xl text-black p-3 self-end shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                      key={idx}
                      ref={isLastMessage ? lastMessageRef : null}
                    >
                      <p className="text-sm font-medium text-red-700 mb-2">
                        You
                      </p>
                      {message.content}
                    </div>
                  );
              }
            })}
            {loading && (
              <div ref={lastMessageRef} className="flex gap-2">
                <img
                  src="/images/football bot.png"
                  className="h-12 w-12 rounded-full"
                />
                <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                  <p className="text-sm font-medium text-red-700 mb-4">
                    AI assistant
                  </p>
                  <LoadingDots />
                </div>
              </div>
            )}
          </div>

          {/* input area */}
          <div className="flex sticky bottom-0 w-full px-6 pb-6 h-24">
            <div className="w-full relative">
              <textarea
                aria-label="chat input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question"
                className="w-full h-full resize-none rounded-2xl border border-slate-900/10 bg-white pl-6 pr-24 py-[25px] text-base placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleClick();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleClick();
                }}
                className="flex w-14 h-14 items-center justify-center rounded-full px-3 text-sm  bg-red-600 font-semibold text-white hover:bg-red-700 active:bg-red-800 absolute right-2 bottom-2 disabled:bg-red-100 disabled:text-red-400"
                type="submit"
                aria-label="Send"
                disabled={!message || loading}
              >
                  <img src="images/football-svgrepo-com.svg" alt="Button icon" />

              </button>
            </div>
           
          </div>
        </form>
      </div>
      <div></div>
      </div>
    </main>
  );
}
