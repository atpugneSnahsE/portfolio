import Section from "./Section";
import FadeIn from "./FadeIn";

const academic = [
  {
    year: "2025 – Present",
    title: "M.Sc. in Artificial Intelligence Systems",
    description:
      "Vilnius Tech • GPA: 9.75/10",
    tags: [
      "LiDAR",
      "Computer Vision",
      "Autonomous Systems",
    ],
  },
  {
    year: "2024",
    title: "B.Tech. in Computer Science & Engineering",
    description:
      "GNDU • ICCR Scholarship • GPA: 8.27/10",
    tags: [
      "Machine Learning",
      "IoT",
      "Software Engineering",
    ],
  },
];

const professional = [
  {
    year: "2024 – 2025",
    title: "IT Intern, BSRM",
    description:
      "ML-based ANPR, forecasting, SQL automation",
    tags: [
      "ANPR",
      "Forecasting",
      "SQL",
    ],
  },
  {
    year: "2022 – Present",
    title: "Collaborative Research",
    description:
      "14 publications across Springer & IEEE",
    tags: [
      "Research",
      "Publications",
      "AI",
    ],
  },
  {
    year: "2024",
    title: "Database Trainee",
    description:
      "Oracle SQL, PL/SQL, APEX",
    tags: [
      "Oracle",
      "PL/SQL",
      "APEX",
    ],
  },
];

function TimelineCard({
  item,
}: {
  item: {
    year: string;
    title: string;
    description: string;
    tags: string[];
  };
}) {
  return (
    <div
      className="
        rounded-2xl sm:rounded-[2rem]
        border p-5 sm:p-7
        transition-all duration-500

        border-zinc-200
        bg-zinc-100
        hover:-translate-y-2
        hover:border-emerald-400
        hover:shadow-xl

        dark:border-zinc-800
        dark:bg-[#0B0C0E]
      "
    >
      <p className="mb-3 text-sm text-emerald-500">
        {item.year}
      </p>

      <h3 className="mb-3 text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">
        {item.title}
      </h3>

      <p className="mb-5 text-zinc-600 dark:text-zinc-400">
        {item.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="
              rounded-full border
              px-3 py-1 text-xs

              border-zinc-300
              bg-white
              text-zinc-600

              dark:border-zinc-700
              dark:bg-zinc-900
              dark:text-zinc-300
            "
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Timeline() {
  return (
    <Section title="Research & Experience">
      <div className="grid gap-10 md:gap-14 lg:grid-cols-[1fr_auto_1fr]">

        {/* Academic */}
        <div>
          <p className="mb-8 text-sm uppercase tracking-[0.25em] text-emerald-500">
            Academic
          </p>

          <div className="space-y-6">
            {academic.map((item, index) => (
              <FadeIn
                key={item.title}
                delay={index * 0.12}
              >
                <TimelineCard item={item} />
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Center Line */}
        <div className="hidden lg:flex justify-center">
          <div className="w-px bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent" />
        </div>

        {/* Professional */}
        <div>
          <p className="mb-8 text-sm uppercase tracking-[0.25em] text-emerald-500">
            Professional & Research
          </p>

          <div className="space-y-6">
            {professional.map((item, index) => (
              <FadeIn
                key={item.title}
                delay={index * 0.12}
              >
                <TimelineCard item={item} />
              </FadeIn>
            ))}
          </div>
        </div>

      </div>
    </Section>
  );
}