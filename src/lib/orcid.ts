type OrcidWork = {
  title: string;
  year: string;
  venue: string;
  url?: string;
  type?: string;
};

const ORCID_ID =
  "0000-0002-6285-7654";

export async function getOrcidWorks(): Promise<
  OrcidWork[]
> {
  try {
    const response =
      await fetch(
        `https://pub.orcid.org/v3.0/${ORCID_ID}/works`,
        {
          headers: {
            Accept:
              "application/json",
          },
          next: {
            revalidate: 86400,
          },
        }
      );

    const data =
      await response.json();

    const groups =
      data.group ?? [];

    return groups.map(
      (group: any) => {
        const summary =
          group[
            "work-summary"
          ]?.[0];

        return {
          title:
            summary?.title?.title
              ?.value ??
            "Untitled",

          year:
            summary
              ?.[
                "publication-date"
              ]?.year?.value ??
            "N/A",

          venue:
            summary?.[
              "journal-title"
            ]?.value ??
            "Publication",

          url:
            summary?.url
              ?.value,

          type:
            summary?.type ??
            "Research",
        };
      }
    );
  } catch (error) {
    console.error(
      "ORCID Fetch Error:",
      error
    );

    return [];
  }
}