import type { ReactNode } from "react";
import { HoverCard } from "./HoverCard";
import { Badge } from "./Badge";
import { Markdown } from "./Markdown";
import { Spinner } from "./Spinner";
import IconOutlink from "@apollo/icons/small/IconOutlink.svg";
import IconGitHub from "@apollo/icons/default/IconGitHubSolid.svg";
import {
  isSnapshotRelease,
  parseSnapshotRelease,
  parseSnapshotTimestamp,
} from "../utilities/github";
import { useGitHubApi } from "../hooks/useGitHubAPI";

interface GitHubReleaseHoverCardProps {
  children?: ReactNode;
  version: string;
}

export function GitHubReleaseHoverCard({
  children,
  version,
}: GitHubReleaseHoverCardProps) {
  return (
    <HoverCard openDelay={0}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Content>
        {isSnapshotRelease(version) ? (
          <SnapshotCardContents version={version} />
        ) : (
          <ReleaseCardContents version={version} />
        )}
      </HoverCard.Content>
    </HoverCard>
  );
}

function SnapshotCardContents({ version }: { version: string }) {
  const release = parseSnapshotRelease(version);
  const { status, data: pullRequest } = useGitHubApi<GitHubPullRequest>(
    `/repos/apollographql/apollo-client/pulls/${release?.prNumber}`,
    { cache: true }
  );

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center min-w-80 min-h-80">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <ErrorMessage message="Error: Could not load pull request from GitHub" />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1 bg-primary dark:bg-primary-dark">
        <h1 className="text-md text-heading dark:text-heading-dark font-heading font-medium flex items-center gap-2">
          <IconGitHub className="size-4" />
          <span className="whitespace-nowrap">{version}</span>
          <Badge variant="info">Snapshot</Badge>
        </h1>
        {release && (
          <>
            <div className="flex gap-1 items-center text-xs font-bold uppercase text-secondary dark:text-secondary-dark">
              Published{" "}
              {formatPublishDate(parseSnapshotTimestamp(release.timestamp))}
            </div>
            <a
              className="flex gap-1 items-center mt-2"
              href={`https://github.com/apollographql/apollo-client/pull/${release.prNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              View pull request in GitHub <IconOutlink className="size-3" />
            </a>
          </>
        )}
      </header>

      <section>
        <h2 className="text-lg text-heading dark:text-heading-dark font-medium mb-2">
          <Markdown>{pullRequest.title}</Markdown>
        </h2>
        <Markdown>{pullRequest.body}</Markdown>
      </section>
    </div>
  );
}

function ReleaseCardContents({ version }: { version: string }) {
  const currentRelease = useGitHubApi<GitHubRelease>(
    `/repos/apollographql/apollo-client/releases/tags/v${version}`,
    { cache: true }
  );

  const latestRelease = useGitHubApi<GitHubRelease>(
    "/repos/apollographql/apollo-client/releases/latest",
    { cache: true }
  );

  if (
    currentRelease.status === "pending" ||
    latestRelease.status === "pending"
  ) {
    return (
      <div className="flex items-center justify-center min-w-80 min-h-80">
        <Spinner size="lg" />
      </div>
    );
  }

  if (currentRelease.status === "error" || latestRelease.status === "error") {
    return <ErrorMessage message="Error: Could not load release from GitHub" />;
  }

  const release = currentRelease.data;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1 bg-primary dark:bg-primary-dark">
        <h2 className="text-2xl text-heading dark:text-heading-dark font-heading font-medium flex items-center gap-2">
          <IconGitHub className="size-6" />
          {release.name}{" "}
          {release.prerelease ? (
            <Badge variant="beta">Pre-release</Badge>
          ) : latestRelease.data.name === release.name ? (
            <Badge variant="success">Latest</Badge>
          ) : (
            <Badge variant="warning">Outdated</Badge>
          )}
        </h2>
        <div className="flex gap-1 items-center text-xs font-bold uppercase text-secondary dark:text-secondary-dark">
          Published {formatPublishDate(Date.parse(release.published_at))}
        </div>
        <a
          className="flex gap-1 items-center mt-2"
          href={`https://github.com/apollographql/apollo-client/releases/tag/v${version}`}
          target="_blank"
          rel="noreferrer"
        >
          View release in GitHub <IconOutlink className="size-3" />
        </a>
      </header>
      <Markdown>{release.body}</Markdown>
    </div>
  );
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  target_commitish: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  state: "open" | "closed";
  locked: boolean;
  title: string;
  body: string;
  created_at: string;
  closed_at: string;
  merged_at: string;
  merge_commit_sha: string;
  user: {
    name: string;
    login: string;
    avatar_url: string;
    url: string;
  };
}

function formatPublishDate(date: Date | number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex min-w-80 min-h-80 items-center justify-center text-md font-semibold">
      {message}
    </div>
  );
}
