import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { ReportButton } from "@/components/report-button";
import { RepostButton } from "@/components/repost-button";

type PostCardProps = {
  id: string;
  author: {
    displayName: string;
    handle: string;
    bio: string | null;
  };
  content: string;
  createdAt: Date;
  stats: {
    likes: number;
    replies: number;
    reposts: number;
  };
  viewer?: {
    liked: boolean;
    reposted?: boolean;
  };
};

const formatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export function PostCard({ id, author, content, createdAt, stats, viewer }: PostCardProps) {
  return (
    <article className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <Link
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-mist font-black text-leaf outline-none transition hover:bg-leaf hover:text-white focus-visible:ring-2 focus-visible:ring-leaf"
          href={`/users/${author.handle}`}
          title={`${author.displayName} 프로필`}
        >
          {author.displayName.slice(0, 1).toUpperCase()}
        </Link>
        <div className="min-w-0 flex-1">
          <Link className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-leaf" href={`/posts/${id}`}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="font-black leading-tight">{author.displayName}</h2>
              <span className="text-sm text-ink/55">@{author.handle}</span>
              <span className="text-sm text-ink/35">·</span>
              <time className="text-sm text-ink/55">{formatter.format(createdAt)}</time>
            </div>
            {author.bio ? <p className="mt-0.5 text-sm text-ink/55">{author.bio}</p> : null}
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-ink">{content}</p>
          </Link>

          <div className="mt-4 grid grid-cols-4 gap-2 text-ink/60">
            <Link
              className="flex h-9 items-center gap-2 rounded-md px-2 text-sm transition hover:bg-mist hover:text-leaf"
              href={`/posts/${id}`}
              title="댓글"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              <span>{stats.replies}</span>
            </Link>
            <RepostButton
              initialCount={stats.reposts}
              initialReposted={viewer?.reposted ?? false}
              postId={id}
            />
            <LikeButton initialCount={stats.likes} initialLiked={viewer?.liked ?? false} postId={id} />
            <ReportButton targetId={id} targetType="post" />
          </div>
        </div>
      </div>
    </article>
  );
}
