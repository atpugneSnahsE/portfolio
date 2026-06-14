"use client";

import { useState } from "react";
import { Bot, X } from "lucide-react";
import ChatWindow from "./ChatWindow";

export default function Chatbot() {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="
          fixed
          bottom-8
          right-8
          z-[9999]
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-emerald-500
          text-black
          shadow-2xl
          transition-all
          duration-300
          hover:scale-110
        "
      >
        {open ? (
          <X size={26} />
        ) : (
          <Bot size={26} />
        )}
      </button>

      {/* Window */}
      {open && (
        <div
          className="
            fixed
            bottom-28
            right-8
            z-[9999]
          "
        >
          <ChatWindow />
        </div>
      )}
    </>
  );
}