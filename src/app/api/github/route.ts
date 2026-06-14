import { NextResponse } from "next/server";

const GITHUB_USERNAME =
  "atpugneSnahsE";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept:
            "application/vnd.github+json",
        },
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status}`
      );
    }

    const repos =
      await response.json();

    const filteredRepos =
      repos
        .filter(
          (repo: any) =>
            !repo.fork &&
            !repo.archived
        )
        .sort(
          (a: any, b: any) =>
            b.stargazers_count -
            a.stargazers_count
        )
        .slice(0, 12)
        .map((repo: any) => ({
          name: repo.name,
          description:
            repo.description ??
            "No description available",
          language:
            repo.language ??
            "Unknown",
          stars:
            repo.stargazers_count,
          updatedAt:
            repo.updated_at,
          url: repo.html_url,
          homepage:
            repo.homepage,
          topics:
            repo.topics ?? [],
        }));

    return NextResponse.json(
      filteredRepos
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      [],
      { status: 500 }
    );
  }
}