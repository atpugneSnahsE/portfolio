"use client";

import Section from "./Section";
import {
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

import {
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";

export default function Contact() {
  return (
    <Section title="Get In Touch">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Side */}
        <div
          className="
            rounded-2xl sm:rounded-[2rem]
            border
            p-6 sm:p-8

            border-zinc-200
            bg-white/70
            backdrop-blur-xl

            dark:border-zinc-800
            dark:bg-[#0B0C0E]
          "
        >
          <div className="mb-6 sm:mb-8">
            <h3 className="mb-3 text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white">
              Let’s build something useful
            </h3>

            <p className="max-w-xl leading-7 text-zinc-600 dark:text-zinc-400">
              Interested in AI research, machine learning,
              computer vision, autonomous systems, or
              collaboration opportunities? Reach out.
            </p>
          </div>

          <div className="space-y-5">
            <a
              href="mailto:eshansengupta2000@gmail.com"
              className="
                flex items-center gap-4
                rounded-2xl border p-5
                transition-all duration-300
                hover:border-emerald-500/40

                border-zinc-200
                dark:border-zinc-800
              "
            >
              <Mail className="h-5 w-5 text-emerald-500" />

              <div>
                <p className="text-sm text-zinc-500">
                  Email
                </p>

                <p className="font-medium text-zinc-900 dark:text-white">
                  eshansengupta2000@gmail.com
                </p>
              </div>
            </a>

            <a
              href="tel:+37065462070"
              className="
                flex items-center gap-4
                rounded-2xl border p-5
                transition-all duration-300
                hover:border-emerald-500/40

                border-zinc-200
                dark:border-zinc-800
              "
            >
              <Phone className="h-5 w-5 text-emerald-500" />

              <div>
                <p className="text-sm text-zinc-500">
                  Phone
                </p>

                <p className="font-medium text-zinc-900 dark:text-white">
                  +370 654 620 70
                </p>
              </div>
            </a>

            <div
              className="
                flex items-center gap-4
                rounded-2xl border p-5

                border-zinc-200
                dark:border-zinc-800
              "
            >
              <MapPin className="h-5 w-5 text-emerald-500" />

              <div>
                <p className="text-sm text-zinc-500">
                  Location
                </p>

                <p className="font-medium text-zinc-900 dark:text-white">
                  Vilnius, Lithuania
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="
            rounded-2xl sm:rounded-[2rem]
            border
            p-6 sm:p-8

            border-zinc-200
            bg-white/70
            backdrop-blur-xl

            dark:border-zinc-800
            dark:bg-[#0B0C0E]
          "
        >
          <h3 className="mb-6 text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white">
            Connect
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <a
              href="https://linkedin.com/in/eshansengupta"
              target="_blank"
              className="group rounded-2xl border border-zinc-200 p-4 sm:p-5 transition hover:border-emerald-500 dark:border-zinc-800"
            >
              <FaLinkedinIn className="mb-3 h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
              <p className="font-medium text-sm sm:text-base dark:text-white break-words">
                LinkedIn
              </p>
            </a>

            <a
              href="https://github.com/atpugneSnahsE"
              target="_blank"
              className="group rounded-2xl border border-zinc-200 p-4 sm:p-5 transition hover:border-emerald-500 dark:border-zinc-800"
            >
              <FaGithub className="mb-3 h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
              <p className="font-medium text-sm sm:text-base dark:text-white break-words">
                GitHub
              </p>
            </a>

            <a
              href="https://orcid.org/0000-0002-6285-7654"
              target="_blank"
              className="group rounded-2xl border border-zinc-200 p-4 sm:p-5 transition hover:border-emerald-500 dark:border-zinc-800"
            >
              <FileText className="mb-3 h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
              <p className="font-medium text-sm sm:text-base dark:text-white break-words">
                ORCID
              </p>
            </a>

            <a
              href="https://twitter.com/_eshansengupta"
              target="_blank"
              className="group rounded-2xl border border-zinc-200 p-4 sm:p-5 transition hover:border-emerald-500 dark:border-zinc-800"
            >
              <FaXTwitter className="mb-3 h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
              <p className="font-medium text-sm sm:text-base dark:text-white break-words">
                X / Twitter
              </p>
            </a>

            <a
              href="https://instagram.com/eshansengupta.me"
              target="_blank"
              className="group rounded-2xl border border-zinc-200 p-4 sm:p-5 transition hover:border-emerald-500 dark:border-zinc-800"
            >
              <FaInstagram className="mb-3 h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
              <p className="font-medium text-sm sm:text-base dark:text-white break-words">
                Instagram
              </p>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}