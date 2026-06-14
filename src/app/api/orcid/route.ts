import { NextResponse } from "next/server";

const ORCID_ID =
  "0000-0002-6285-7654";

export async function GET() {
  try {
    const response = await fetch(
      `https://pub.orcid.org/v3.0/${ORCID_ID}/works`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `ORCID error: ${response.status}`
      );
    }

    const data = await response.json();

    const publications =
      data.group?.map((group: any) => {
        const work =
          group["work-summary"]?.[0];

        return {
          title:
            work?.title?.title?.value ??
            "Untitled",

          year:
            work?.["publication-date"]
              ?.year?.value ?? "Unknown",

          type:
            work?.type ?? "Research",

          venue:
            work?.["journal-title"]
              ?.value ??
            "Unknown Venue",

          url:
            work?.url?.value ??
            null,
        };
      }) ?? [];

    return NextResponse.json(
      publications
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      [],
      { status: 500 }
    );
  }
}