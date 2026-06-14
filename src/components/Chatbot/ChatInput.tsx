"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type ChatInputProps = {
  onSend: (message: string) => void;
  loading?: boolean;
};

export default function ChatInput({
  onSend,
  loading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim() || loading) return;

    onSend(message);
    setMessage("");
  };

  return (
    <div
      className="
        border-t
        border-zinc-200
        p-4
        dark:border-zinc-800
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-zinc-200
          bg-zinc-100
          px-4
          py-3
          dark:border-zinc-800
          dark:bg-zinc-900
        "
      >
        <input
          type="text"
          value={message}
          placeholder="Ask about Eshan..."
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="
            w-full
            bg-transparent
            text-sm
            outline-none
            placeholder:text-zinc-400
            dark:text-white
          "
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-emerald-500
            text-black
            transition
            hover:scale-105
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}