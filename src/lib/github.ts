type Repo = {
  name: string;
  description: string;
  html_url: string;
  homepage?: string;
  topics?: string[];
  stargazers_count: number;
  pushed_at: string;
};

const USERNAME =
  "atpugneSnahsE";

export async function getGithubProjects(): Promise<
  Repo[]
> {
  try {
    const response =
      await fetch(
        `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=12`,
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

    const repos =
      await response.json();

    return repos
      .filter(
        (repo: Repo) =>
          !repo.name.startsWith(
            "."
          )
      )
      .sort(
        (
          a: Repo,
          b: Repo
        ) =>
          b.stargazers_count -
          a.stargazers_count
      );
  } catch (error) {
    console.error(
      "GitHub Fetch Error:",
      error
    );

    return [];
  }
}