import Section from "./Section";
import ResearchCanvas from "./ResearchCanvas";
import { getOrcidWorks } from "@/lib/orcid";

export default async function Publications() {
  const publications =
    await getOrcidWorks();

  return (
    <Section title="Publications">
      {/* 3D Research Canvas */}
      <div className="relative mb-12 overflow-hidden w-full">
        {/* Top blend */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-white to-transparent dark:from-black" />

        <ResearchCanvas
          publications={publications}
        />

        {/* Bottom blend */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-white to-transparent dark:from-black" />
      </div>

      {/* Stats */}
      <div className="mb-12 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-black">
          ORCID: 0000-0002-6285-7654
        </span>

        <span className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700">
          {publications.length} Publications
        </span>
      </div>

      {/* Publication List */}
    <div className="relative overflow-visible pt-4">
    <div
      className="
        flex gap-6 overflow-x-auto overflow-y-visible
        scroll-smooth
        pt-4
        pb-8
        snap-x
        snap-mandatory

        scrollbar-thin
        scrollbar-thumb-zinc-700
        scrollbar-track-transparent
      "
    >
        {publications.map(
        (
            publication: any,
            index: number
        ) => (
            <div
            key={`${publication.title}-${index}`}
            className="
                group
                min-w-[380px]
                snap-center

                rounded-[2rem]
                border
                p-7
                transition-all
                duration-500

                border-zinc-200
                bg-white/70
                hover:-translate-y-2
                hover:border-emerald-500/40
                hover:shadow-2xl

                dark:border-zinc-800
                dark:bg-[#0B0C0E]
            "
            >
            <div className="mb-5 flex items-center justify-between">
                <span
                className="
                    rounded-full
                    border
                    px-4 py-1
                    text-xs
                    font-medium

                    border-zinc-300
                    bg-white
                    text-zinc-700

                    dark:border-zinc-700
                    dark:bg-zinc-900
                    dark:text-zinc-300
                "
                >
                {publication.venue}
                </span>

                <span className="text-sm text-emerald-500">
                {publication.year}
                </span>
            </div>

            <h3
                className="
                mb-5
                line-clamp-3
                text-xl
                font-semibold
                leading-snug

                text-zinc-900
                dark:text-white
                "
            >
                {publication.title}
            </h3>

            <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">
                {publication.type}
                </p>

                {publication.url && (
                <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                    rounded-xl
                    border
                    px-4 py-2
                    text-sm
                    transition

                    border-zinc-300
                    hover:border-emerald-500
                    hover:text-emerald-500

                    dark:border-zinc-700
                    "
                >
                    Read →
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