export function normalizeHandle(handle: string) {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

export function isValidHandle(handle: string) {
  return /^[a-z0-9_]{3,24}$/.test(handle);
}
