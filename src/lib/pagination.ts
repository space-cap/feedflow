type CursorInput = {
  createdAt: Date;
  id: string;
};

export function parseLimit(value: string | null, fallback = 20, max = 50) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), max);
}

export function encodeCursor(input: CursorInput) {
  return Buffer.from(`${input.createdAt.toISOString()}:${input.id}`, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string | null) {
  if (!cursor) {
    return null;
  }

  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const separatorIndex = decoded.lastIndexOf(":");
    const createdAt = new Date(decoded.slice(0, separatorIndex));
    const id = decoded.slice(separatorIndex + 1);

    if (!id || Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return { createdAt, id };
  } catch {
    return null;
  }
}

export function cursorWhere(cursor: ReturnType<typeof decodeCursor>) {
  if (!cursor) {
    return {};
  }

  return {
    OR: [
      {
        createdAt: {
          lt: cursor.createdAt
        }
      },
      {
        createdAt: cursor.createdAt,
        id: {
          lt: cursor.id
        }
      }
    ]
  };
}

export function getNextCursor<T extends CursorInput>(items: T[], limit: number) {
  if (items.length <= limit) {
    return null;
  }

  const last = items[limit - 1];
  return encodeCursor(last);
}

export function trimPage<T>(items: T[], limit: number) {
  return items.slice(0, limit);
}
