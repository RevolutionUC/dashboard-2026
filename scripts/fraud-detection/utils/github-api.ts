export interface RepoInfo {
  exists: boolean;
  isPrivate: boolean;
  isForked: boolean;
  forkParent: string | null;
  createdAt: Date | null;
  defaultBranch: string;
  error: string | null;
}

export async function getRepoInfo(repoUrl: string, token?: string): Promise<RepoInfo> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return {
      exists: false,
      isPrivate: false,
      isForked: false,
      forkParent: null,
      createdAt: null,
      defaultBranch: "main",
      error: "Invalid GitHub URL",
    };
  }

  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RevolutionUC-Fraud-Detection",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const response = await fetch(apiUrl, { headers });

    if (response.status === 404) {
      return {
        exists: false,
        isPrivate: false,
        isForked: false,
        forkParent: null,
        createdAt: null,
        defaultBranch: "main",
        error: "Repository not found (404) - may be private or deleted",
      };
    }

    if (response.status === 403) {
      const resetTime = response.headers.get("X-RateLimit-Reset");
      return {
        exists: true,
        isPrivate: true,
        isForked: false,
        forkParent: null,
        createdAt: null,
        defaultBranch: "main",
        error: `Rate limited. Reset at: ${resetTime ? new Date(Number.parseInt(resetTime) * 1000).toISOString() : "unknown"}`,
      };
    }

    if (!response.ok) {
      return {
        exists: false,
        isPrivate: false,
        isForked: false,
        forkParent: null,
        createdAt: null,
        defaultBranch: "main",
        error: `GitHub API error: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      exists: true,
      isPrivate: data.private || false,
      isForked: data.fork || false,
      forkParent: data.parent?.html_url || null,
      createdAt: data.created_at ? new Date(data.created_at) : null,
      defaultBranch: data.default_branch || "main",
      error: null,
    };
  } catch (error) {
    return {
      exists: false,
      isPrivate: false,
      isForked: false,
      forkParent: null,
      createdAt: null,
      defaultBranch: "main",
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export class RateLimiter {
  private lastRequest = 0;
  private minInterval: number;

  constructor(requestsPerSecond = 2) {
    this.minInterval = 1000 / requestsPerSecond;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.minInterval) {
      await new Promise((resolve) => setTimeout(resolve, this.minInterval - elapsed));
    }
    this.lastRequest = Date.now();
  }
}
