import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";

type PostCardProps = {
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
};

const formatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export function PostCard({ author, content, createdAt, stats }: PostCardProps) {
  return (
    <article className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-mist font-black text-leaf">
          {author.displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="font-black leading-tight">{author.displayName}</h2>
            <span className="text-sm text-ink/55">@{author.handle}</span>
            <span className="text-sm text-ink/35">·</span>
            <time className="text-sm text-ink/55">{formatter.format(createdAt)}</time>
          </div>
          {author.bio ? <p className="mt-0.5 text-sm text-ink/55">{author.bio}</p> : null}
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-ink">{content}</p>

          <div className="mt-4 grid grid-cols-4 gap-2 text-ink/60">
            <button
              className="flex h-9 items-center gap-2 rounded-md px-2 text-sm transition hover:bg-mist hover:text-leaf"
              type="button"
              title="댓글"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              <span>{stats.replies}</span>
            </button>
            <button
              className="flex h-9 items-center gap-2 rounded-md px-2 text-sm transition hover:bg-mist hover:text-leaf"
              type="button"
              title="재게시"
            >
              <Repeat2 aria-hidden="true" className="h-4 w-4" />
              <span>{stats.reposts}</span>
            </button>
            <button
              className="flex h-9 items-center gap-2 rounded-md px-2 text-sm transition hover:bg-[#fff0ed] hover:text-coral"
              type="button"
              title="좋아요"
            >
              <Heart aria-hidden="true" className="h-4 w-4" />
              <span>{stats.likes}</span>
            </button>
            <button
              className="flex h-9 items-center justify-end gap-2 rounded-md px-2 text-sm transition hover:bg-mist hover:text-leaf"
              type="button"
              title="공유"
            >
              <Share aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
