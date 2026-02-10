import axios from "axios";
import { config } from "../config.js";

const github = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `token ${config.githubToken}`,
  },
});

export async function getUser(username: string) {
  return (await github.get(`/users/${username}`)).data;
}

export async function getRepos(username: string) {
  return (
    await github.get(`/users/${username}/repos`, {
      params: { per_page: 100, sort: "updated" },
    })
  ).data;
}

export async function getRepoTree(
  owner: string,
  repo: string,
  branch: string
) {
  return (
    await github.get(
      `/repos/${owner}/${repo}/git/trees/${branch}`,
      { params: { recursive: 1 } }
    )
  ).data.tree;
}

export async function getReadme(owner: string, repo: string) {
  try {
    const res = await github.get(`/repos/${owner}/${repo}/readme`);
    return Buffer.from(res.data.content, "base64").toString();
  } catch {
    return null;
  }
}

export function rankGithubRepos( repos: any[], limit = 5) {
  return repos
    .filter(repo =>
    !repo.fork && 
    !repo.archived &&
    repo.size > 0 
    )
    .map(repo => {
      const score =
        repo.stargazers_count * 3 +
        repo.forks_count * 2 +
        repo.watchers_count +
        (repo.language ? 5 : 0) +
        (repo.open_issues_count === 0 ? 3 : 0) +
        recencyScore(repo.updated_at);

      return { ...repo, __score: score };
    })
    .sort((a, b) => b.__score - a.__score)
    .slice(0, limit);
}

function recencyScore(updatedAt: string) {
  const monthsAgo =
    (Date.now() - new Date(updatedAt).getTime()) /
    (1000 * 60 * 60 * 24 * 30);

  if (monthsAgo < 1) return 15;
  if (monthsAgo < 6) return 10;
  if (monthsAgo < 12) return 5;
  return 0;
}
