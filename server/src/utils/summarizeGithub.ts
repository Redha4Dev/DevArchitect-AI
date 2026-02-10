export const summarizeGithubForAI = (normalized: any): string => {
  const { profile, statistics, repositories } = normalized;

  let summary = `GitHub Profile Analysis:
- Username: ${profile.username}
- Bio: ${profile.bio || "N/A"}
- Account Age: ${profile.accountAgeYears} years
- Followers: ${profile.followers}, Public Repos: ${profile.publicRepos}
- Most Used Languages: ${statistics.dominantLanguages.join(", ")}

Repositories Summary:
`;

  repositories.forEach((repo: any) => {
    summary += `
- ${repo.name}: ${repo.description || "No description"}
  - Primary Language: ${repo.primaryLanguage || "N/A"}
  - Stars: ${repo.stars}
  - Structure: ${Object.entries(repo.structure)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")}
  - Readme Score: ${repo.readmeQuality}/4
  - Key Indicators: ${Object.entries(repo.indicators)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")}
`;
  });

  return summary.trim();
};
