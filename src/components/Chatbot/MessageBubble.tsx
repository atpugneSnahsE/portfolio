"use client";

type MessageBubbleProps = {
  role: "user" | "assistant";
  text: string;
};

export default function MessageBubble({
  role,
  text,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm ${
          isUser
            ? `
              bg-emerald-500
              text-black
              rounded-br-md
            `
            : `
              border
              border-zinc-200
              bg-white
              text-zinc-800
              rounded-bl-md
              dark:border-zinc-800
              dark:bg-zinc-900
              dark:text-zinc-200
            `
        }`}
      >
        {text}
      </div>
    </div>
  );
}