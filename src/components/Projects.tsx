import Section from "./Section";
import { getGithubProjects } from "@/lib/github";

export default async function Projects() {
  const projects = await getGithubProjects();

  return (
    <Section title="Projects">
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-black">
          GitHub: atpugneSnahsE
        </span>

        <span className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700">
          {projects.length} Projects
        </span>
      </div>

      {/* Prevent hover cut-off */}
      <div className="overflow-visible pt-6">
        <div
          className="
            flex
            gap-6
            overflow-x-auto
            overflow-y-visible
            scroll-smooth
            py-4
            pb-8
            snap-x
            snap-mandatory
            items-stretch

            scrollbar-thin
            scrollbar-thumb-zinc-700
            scrollbar-track-transparent
          "
        >
          {projects.map(
            (project: any, index: number) => (
              <div
                key={index}
                className="
                  group
                  min-w-[80vw]
                  max-w-[80vw]
                  sm:min-w-[380px]
                  sm:max-w-[380px]
                  md:min-w-[420px]
                  md:max-w-[420px]
                  min-h-[300px]
                  sm:min-h-[380px]
                  md:min-h-[420px]
                  snap-center

                  flex
                  flex-col
                  justify-between

                  rounded-2xl sm:rounded-[2rem]
                  border
                  p-5 sm:p-6 md:p-8
                  transition-all
                  duration-500
                  will-change-transform

                  border-zinc-200
                  bg-white/70
                  hover:-translate-y-3
                  hover:border-emerald-500/40
                  hover:shadow-2xl

                  dark:border-zinc-800
                  dark:bg-[#0B0C0E]
                "
              >
                {/* Top content */}
                <div>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h3
                        className="
                          text-2xl
                          font-semibold
                          text-zinc-900
                          dark:text-white
                        "
                      >
                        {project.name}
                      </h3>
                    </div>

                    <span className="whitespace-nowrap rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500">
                      ★ {project.stars}
                    </span>
                  </div>

                  <p
                    className="
                      mb-6
                      min-h-[90px]
                      leading-7
                      text-zinc-600
                      dark:text-zinc-400
                    "
                  >
                    {project.description ||
                      "No description available."}
                  </p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {project.language && (
                      <span
                        className="
                          rounded-full
                          border
                          px-4 py-2
                          text-sm

                          border-zinc-300
                          text-zinc-700

                          dark:border-zinc-700
                          dark:text-zinc-300
                        "
                      >
                        {project.language}
                      </span>
                    )}

                    {project.topics
                      ?.slice(0, 3)
                      .map((topic: string) => (
                        <span
                          key={topic}
                          className="
                            rounded-full
                            bg-zinc-200
                            px-3 py-2
                            text-xs

                            dark:bg-zinc-800
                          "
                        >
                          {topic}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="flex gap-3 pt-4">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      rounded-xl
                      bg-emerald-500
                      px-5 py-3
                      text-sm
                      font-medium
                      text-black
                      transition
                      hover:scale-105
                    "
                  >
                    GitHub
                  </a>

                  {project.homepage && (
                    <a
                      href={project.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        rounded-xl
                        border
                        px-5 py-3
                        text-sm
                        transition

                        border-zinc-300
                        hover:border-emerald-500

                        dark:border-zinc-700
                      "
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </Section>
  );
}