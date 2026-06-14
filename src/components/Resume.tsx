"use client";

import Section from "./Section";
import {
  Download,
  FileText,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";

export default function Resume() {
  return (
    <Section title="Resume">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Side */}
        <div
          className="
            rounded-[2rem]
            border
            p-8

            border-zinc-200
            bg-white/70
            backdrop-blur-xl

            dark:border-zinc-800
            dark:bg-[#0B0C0E]
          "
        >
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-emerald-500">
                Professional Profile
              </p>

              <h3 className="mb-4 text-4xl font-semibold text-zinc-900 dark:text-white">
                Eshan Sengupta
              </h3>

              <p className="max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
                AI Researcher focused on Machine Learning,
                Computer Vision, LiDAR perception,
                IoT-Fog computing, and autonomous systems.
                Published across Springer, IEEE, and
                high-impact venues with focus on
                real-world intelligent systems.
              </p>
            </div>

            <div className="hidden rounded-3xl bg-emerald-500/10 p-5 lg:block">
              <FileText className="h-10 w-10 text-emerald-500" />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <GraduationCap className="mb-4 h-6 w-6 text-emerald-500" />

              <h4 className="mb-2 font-semibold dark:text-white">
                Education
              </h4>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                MSc Artificial Intelligence
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <Briefcase className="mb-4 h-6 w-6 text-emerald-500" />

              <h4 className="mb-2 font-semibold dark:text-white">
                Experience
              </h4>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Research, AI, Enterprise Systems
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <Award className="mb-4 h-6 w-6 text-emerald-500" />

              <h4 className="mb-2 font-semibold dark:text-white">
                Publications
              </h4>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Springer, IEEE, ORCID Synced
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="
            flex flex-col justify-between
            rounded-[2rem]
            border
            p-8

            border-zinc-200
            bg-white/70
            backdrop-blur-xl

            dark:border-zinc-800
            dark:bg-[#0B0C0E]
          "
        >
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-emerald-500">
              Resume Access
            </p>

            <h3 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-white">
              Download CV
            </h3>

            <p className="mb-8 leading-7 text-zinc-600 dark:text-zinc-400">
              View detailed education, publications,
              technical expertise, experience,
              certifications, and research profile.
            </p>
          </div>

          <div className="space-y-4">
            <a
              href="/resume.pdf"
              download
              className="
                flex items-center justify-center gap-3
                rounded-2xl
                bg-emerald-500
                px-6 py-4
                font-medium
                text-black
                transition
                hover:scale-[1.02]
              "
            >
              <Download className="h-5 w-5" />
              Download Resume
            </a>

            <a
              href="/resume.html"
              className="
                flex items-center justify-center gap-3
                rounded-2xl
                border
                px-6 py-4
                transition

                border-zinc-300
                hover:border-emerald-500

                dark:border-zinc-700
              "
            >
              <FileText className="h-5 w-5" />
              View Interactive Resume
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}