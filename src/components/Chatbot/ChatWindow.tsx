"use client";

import { useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text:
        "Hi. Ask me anything about Eshan, research, publications, projects, or experience.",
    },
  ]);

  const [loading, setLoading] =
    useState(false);

  const sendMessage = async (
    message: string
  ) => {
    const userMessage: Message = {
      role: "user",
      text: message,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message,
          }),
        }
      );

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.response ||
            "Failed to generate response.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        bottom-24
        right-6
        z-50
        flex
        h-[520px]
        w-[360px]
        flex-col
        overflow-hidden
        rounded-[2rem]
        border
        border-zinc-200
        bg-white
        shadow-2xl
        dark:border-zinc-800
        dark:bg-[#0B0C0E]
      "
    >
      <div
        className="
          border-b
          border-zinc-200
          px-5
          py-4
          dark:border-zinc-800
        "
      >
        <h3 className="font-semibold">
          Eshan AI Assistant
        </h3>

        <p className="text-xs text-zinc-500">
          Research, projects, resume,
          publications
        </p>
      </div>

      <div
        className="
          flex-1
          space-y-4
          overflow-y-auto
          p-4
        "
      >
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            role={msg.role}
            text={msg.text}
          />
        ))}

        {loading && (
          <MessageBubble
            role="assistant"
            text="Thinking..."
          />
        )}
      </div>

      <ChatInput
        onSend={sendMessage}
        loading={loading}
      />
    </div>
  );
}