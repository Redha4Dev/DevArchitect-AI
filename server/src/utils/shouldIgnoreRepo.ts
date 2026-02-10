export function shouldIgnoreRepo(
  repoName: string,
  username: string,
  files?: string[]
): boolean {
  const name = repoName.toLowerCase()

  // Profile README repo
  if (name === username.toLowerCase()) return true

  // Portfolio repos
  if (name.includes("portfolio")) return true

  // README-only repos (defensive)
  if (
    Array.isArray(files) &&
    files.length === 1 &&
    //@ts-ignore
    files[0].toLowerCase() === "readme.md"
  ) {
    return true
  }

  return false
}
