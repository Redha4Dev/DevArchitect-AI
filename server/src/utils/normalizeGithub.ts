import { shouldIgnoreRepo } from "./shouldIgnoreRepo.js";

export const normalizeGithubData = (user: any, repos: any[]) => {
  const totalReposAnalyzed = repos.length;

  const languagesMap: Record<string, number> = {};

  const languageCount: Record<string, number> = {};

  let totalStars = 0;
  let templateLikeRepos = 0;

  const normalizedRepos = repos.filter(repo => !shouldIgnoreRepo(repo.name, user.login, repo.files)).map((repo) => {
    totalStars += repo.stargazers_count || 0;

    // Teaching / demo signal
    if ((repo.size || 0) < 500) templateLikeRepos++;

    repo.languages?.forEach((lang: string) => {
      languagesMap[lang] = (languagesMap[lang] || 0) + 1;
    });

    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    }

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
        hasTests:
          containsFolder(repo.tree, "test") ||
          containsFolder(repo.tree, "__tests__"),
        hasCI: containsCI(repo.tree),
        hasEnvExample: containsFile(repo.tree, ".env.example"),
        hasDocker: containsFile(repo.tree, "Dockerfile"),
      },
    };
  });

  const averageStars = Math.round(totalStars / Math.max(totalReposAnalyzed, 1));

  const accountAgeYears = calculateAccountAge(user.created_at);

  const averageRepoStars =
    repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) / totalReposAnalyzed;

  const highVisibilityAccount = user.followers > 500 || averageRepoStars > 100;

  const likelyEducationalProfile =
    user.bio?.toLowerCase().includes("course") ||
    user.bio?.toLowerCase().includes("tutorial") ||
    repos.every((r) => r.readmeQuality <= 1);

  return {
    profile: {
      username: user.login,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      accountAgeYears,
    },

    reputationSignals: {
      followers: user.followers,
      accountAgeYears: calculateAccountAge(user.created_at),
      averageRepoStars: Math.round(averageRepoStars),
      highVisibilityAccount,
    },

    analysisMeta: {
      reposAnalyzed: totalReposAnalyzed,
      repoSelectionMethod:
        "Top ranked non-fork repositories by stars and recent activity",
      limitations: [
        "Only public repositories were analyzed",
        "Only up to 5 representative repositories were included",
        "Educational or demo repositories may intentionally be simplified",
      ],
    },

    contextHints: {
      likelyEducationalProfile,
    },

    statistics: {
      dominantLanguages: Object.entries(languageCount)
        .sort((a, b) => b[1] - a[1])
        .map(([lang]) => lang),
    },

    repositories: normalizedRepos,
  };
};

const analyzeRepoStructure = (tree: any[]) => {
  const folders = tree.filter((f) => f.type === "tree").map((f) => f.path);

  return {
    hasSrc: folders.includes("src"),
    hasControllers: folders.some((f) => f.includes("controller")),
    hasServices: folders.some((f) => f.includes("service")),
    hasUtils: folders.some((f) => f.includes("utils")),
    depthScore: Math.min(folders.length / 10, 1),
  };
};

const scoreReadme = (readme: string | null) => {
  if (!readme) return 0; // NONE

  let score = 1; // MINIMAL
  if (readme.length > 300) score = 2;
  if (/install|usage|setup/i.test(readme)) score = 3;
  if (/api|endpoint|architecture/i.test(readme)) score = 4;

  return score;
};


const containsFolder = (tree: any[], name: string) =>
  tree.some((f) => f.type === "tree" && f.path.toLowerCase().includes(name));

const containsFile = (tree: any[], name: string) =>
  tree.some((f) => f.type === "blob" && f.path === name);

const containsCI = (tree: any[]) =>
  tree.some((f) => f.path.startsWith(".github/workflows"));

const calculateAccountAge = (date: string) => {
  const created = new Date(date);
  const now = new Date();
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365),
  );
};
