import Section from "./Section";
import FadeIn from "./FadeIn";

const skillGroups = [
  {
    title: "AI & Machine Learning",
    skills: [
      "Machine Learning",
      "PyTorch",
      "Scikit-learn",
      "NumPy",
      "Pandas",
      "Time Series Forecasting",
      "Computer Vision",
      "Object Detection",
      "Deep Learning",
      "NLP Fundamentals",
      "GenAI",
      "Machine Learning Pipelines",
    ],
  },
  {
    title: "Data Science & Analytics",
    skills: [
      "Statistical Analysis",
      "Exploratory Data Analysis",
      "Data Cleaning",
      "Data Visualization",
      "KPI Analysis",
      "Power BI",
      "Dashboarding",
      "Tableau Concepts",
      "Systematized Reporting",
      "Predictive Analytics",
    ],
  },
  {
    title: "Programming & Data Technologies",
    skills: [
      "Python",
      "SQL",
      "PL/SQL",
      "Oracle APEX",
      "Database Management",
      "REST APIs",
      "Git",
      "Java",
      "MATLAB",
    ],
  },
  {
    title: "Research & Engineering",
    skills: [
      "Quantitative Research",
      "Academic Publishing",
      "Literature Review",
      "Signal Processing",
      "LiDAR Systems",
      "Autonomous Systems",
      "Real-Time Systems",
      "Mathematical Modeling",
      "Cybersecurity",
    ],
  },
  {
    title: "Business & Systems",
    skills: [
      "Business Process Mapping",
      "BPMN 2.0",
      "Requirements Elicitation",
      "Gap Analysis",
      "Stakeholder Management",
      "UAT Execution",
      "Agile Scrum",
      "SDLC",
      "Jira",
      "Oracle EBS",
      "Azure DevOps",
    ],
  },
];

export default function Skills() {
  return (
    <Section title="Technical Expertise">
      <div className="grid gap-8 lg:grid-cols-2">
        {skillGroups.map(
          (group, index) => (
            <FadeIn
              key={group.title}
              delay={index * 0.08}
            >
              <div
                className="
                  group
                  rounded-[2rem]
                  border
                  p-8
                  backdrop-blur-xl
                  transition-all
                  duration-500

                  border-zinc-200
                  bg-white/60
                  hover:-translate-y-2
                  hover:border-emerald-500/30
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]

                  dark:border-zinc-800
                  dark:bg-[#0B0C0E]/80
                  dark:hover:border-emerald-500/40
                "
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />

                  <h3
                    className="
                      text-xl
                      font-semibold
                      text-zinc-900
                      dark:text-white
                    "
                  >
                    {group.title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {group.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="
                          rounded-full
                          border
                          px-4
                          py-2
                          text-sm
                          transition-all
                          duration-300

                          border-zinc-300
                          bg-white/80
                          text-zinc-700
                          hover:scale-105
                          hover:border-emerald-500
                          hover:text-emerald-600

                          dark:border-zinc-700
                          dark:bg-zinc-900
                          dark:text-zinc-300
                          dark:hover:text-emerald-400
                        "
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </FadeIn>
          )
        )}
      </div>
    </Section>
  );
}