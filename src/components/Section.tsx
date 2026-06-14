type SectionProps = {
  id?: string;
  title?: string;
  children: React.ReactNode;
};

export default function Section({
  id,
  title,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className="
        mx-auto
        w-full
        max-w-7xl
        px-6
        md:px-8
        py-14
        md:py-16
      "
    >
      {title && (
        <div className="mb-8 md:mb-10">
          <p
            className="
              mb-2
              text-xs
              uppercase
              tracking-[0.25em]
              text-emerald-500
            "
          >
            // SECTION
          </p>

          <h2
            className="
              text-3xl
              font-bold
              tracking-tight
              text-zinc-900
              dark:text-white
              md:text-5xl
            "
          >
            {title}
          </h2>
        </div>
      )}

      {children}
    </section>
  );
}