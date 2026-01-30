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
      params: { per_page: 5, sort: "updated" },
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
