const HASHTAG_PATTERN = /(^|\s)#([0-9A-Za-z가-힣_]{1,40})/g;

export function extractHashtags(content: string) {
  const tags = new Set<string>();

  for (const match of content.matchAll(HASHTAG_PATTERN)) {
    tags.add(match[2].toLowerCase());
  }

  return [...tags];
}

export function normalizeHashtag(value: string) {
  return value.replace(/^#/, "").trim().toLowerCase();
}
