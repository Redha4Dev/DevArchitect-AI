export const normalizeGithubData = (user: any, repos: any[]) => {
  const totalRepos = repos.length;

  const languagesMap: Record<string, number> = {};

  const normalizedRepos = repos.map(repo => {
    repo.languages?.forEach((lang: string) => {
      languagesMap[lang] = (languagesMap[lang] || 0) + 1;
    });

    return {
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      isPrivate: repo.private,

      primaryLanguage: repo.language,
      languagesUsed: repo.languages || [],

      structure: analyzeRepoStructure(repo.tree || []),

      readmeQuality: scoreReadme(repo.readme),

      indicators: {
        hasTests: containsFolder(repo.tree, "test") || containsFolder(repo.tree, "__tests__"),
        hasCI: containsCI(repo.tree),
        hasEnvExample: containsFile(repo.tree, ".env.example"),
        hasDocker: containsFile(repo.tree, "Dockerfile"),
      },
    };
  });

  return {
    profile: {
      username: user.login,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      accountAgeYears: calculateAccountAge(user.created_at),
    },

    statistics: {
      totalRepos,
      dominantLanguages: Object.entries(languagesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang),
    },

    repositories: normalizedRepos,
  };
};

const analyzeRepoStructure = (tree: any[]) => {
  const folders = tree.filter(f => f.type === "tree").map(f => f.path);

  return {
    hasSrc: folders.includes("src"),
    hasControllers: folders.some(f => f.includes("controller")),
    hasServices: folders.some(f => f.includes("service")),
    hasUtils: folders.some(f => f.includes("utils")),
    depthScore: Math.min(folders.length / 10, 1),
  };
};

const scoreReadme = (readme: string | null) => {
  if (!readme) return 0;

  let score = 0;

  if (readme.length > 500) score++;
  if (/install|usage|setup/i.test(readme)) score++;
  if (/api|endpoint/i.test(readme)) score++;
  if (/license/i.test(readme)) score++;

  return score; // max 4
};

const containsFolder = (tree: any[], name: string) =>
  tree.some(f => f.type === "tree" && f.path.toLowerCase().includes(name));

const containsFile = (tree: any[], name: string) =>
  tree.some(f => f.type === "blob" && f.path === name);

const containsCI = (tree: any[]) =>
  tree.some(f => f.path.startsWith(".github/workflows"));

const calculateAccountAge = (date: string) => {
  const created = new Date(date);
  const now = new Date();
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );
};
