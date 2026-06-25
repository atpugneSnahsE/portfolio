"use client";
import dynamic from "next/dynamic";
import FadeIn from "./FadeIn";

const VesselCanvas = dynamic(
  () => import("./VesselCanvas"),
  {
    ssr: false,
    loading: () => (
      <div
        className="
          flex
          h-[500px]
          w-full
          items-center
          justify-center
          rounded-[2rem]
          border
          border-zinc-200
          bg-zinc-100/60
          backdrop-blur-xl
          dark:border-zinc-800
          dark:bg-zinc-900/60
        "
      >
        <div className="text-center">
          <p className="text-lg text-zinc-500">
            Loading ...
          </p>
        </div>
      </div>
    ),
  }
);

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-screen max-w-7xl items-center px-8 pt-20">
      <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-2">
        {/* LEFT */}
        <FadeIn>
          <div className="flex flex-col justify-center">
            <p className="mb-5 text-sm uppercase tracking-[0.3em] text-emerald-500">
              Machine Learning • Artificial Intelligence • IoT
            </p>

            <h1
              className="
                mb-6
                text-5xl
                font-bold
                leading-[0.95]
                tracking-tight
                text-zinc-900
                dark:text-white
                md:text-7xl
              "
            >
              Eshan
              <br />
              Sengupta
            </h1>

            <p
              className="
                mb-10
                max-w-xl
                text-lg
                leading-9
                text-zinc-600
                dark:text-zinc-400
              "
            >
              Machine Learning Engineer and Researcher
              focused on LiDAR perception,
              autonomous systems, computer
              vision, and intelligent
              embedded systems.
            </p>

            {/* credibility row */}
            <div className="mb-10 flex flex-wrap gap-4">
              <div
                className="
                  rounded-[2rem]
                  border
                  border-zinc-200
                  bg-zinc-100/70
                  px-6
                  py-5
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-emerald-500/30
                  dark:border-zinc-800
                  dark:bg-zinc-900/70
                "
              >
                <p className="text-3xl font-bold text-emerald-500">
                  14+
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Publications
                </p>
              </div>

              <div
                className="
                  rounded-[2rem]
                  border
                  border-zinc-200
                  bg-zinc-100/70
                  px-6
                  py-5
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-emerald-500/30
                  dark:border-zinc-800
                  dark:bg-zinc-900/70
                "
              >
                <p className="text-3xl font-bold text-emerald-500">
                  14
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Research Papers
                </p>
              </div>

              <div
                className="
                  rounded-[2rem]
                  border
                  border-zinc-200
                  bg-zinc-100/70
                  px-6
                  py-5
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-emerald-500/30
                  dark:border-zinc-800
                  dark:bg-zinc-900/70
                "
              >
                <p className="text-3xl font-bold text-emerald-500">
                  AI
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Research Focus
                </p>
              </div>
            </div>

            {/* buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href="/resume.html"
                rel="noopener noreferrer"
                className="
                  rounded-2xl
                  bg-emerald-500
                  px-7
                  py-4
                  font-medium
                  text-black
                  transition-all
                  duration-300
                  hover:scale-105
                  hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]
                "
              >
                Resume
              </a>

              <a
                href="https://linkedin.com/in/eshansengupta"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  rounded-2xl
                  border
                  border-zinc-300
                  px-7
                  py-4
                  font-medium
                  transition-all
                  duration-300
                  hover:border-emerald-500
                  hover:text-emerald-500
                  dark:border-zinc-700
                "
              >
                LinkedIn
              </a>
            </div>
          </div>
        </FadeIn>

        {/* RIGHT */}
        <FadeIn delay={0.2} y={50}>
          <div className="flex h-full min-h-[600px] items-center justify-center">
            <VesselCanvas />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}