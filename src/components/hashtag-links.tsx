import Link from "next/link";
import { extractHashtags } from "@/lib/hashtags";

type HashtagLinksProps = {
  content: string;
};

export function HashtagLinks({ content }: HashtagLinksProps) {
  const tags = extractHashtags(content);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          className="rounded-md bg-mist px-2 py-1 text-xs font-bold text-leaf transition hover:bg-leaf hover:text-white"
          href={`/explore?tag=${encodeURIComponent(tag)}`}
          key={tag}
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
