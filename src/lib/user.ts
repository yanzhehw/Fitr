const USER_ID_KEY = 'fitr_user_id';

/**
 * Ensures a local user ID exists in chrome.storage.local.
 * Generates a new UUID on first call, returns the existing one otherwise.
 */
export async function ensureUserId(): Promise<string> {
  const result = await chrome.storage.local.get([USER_ID_KEY]);
  if (result[USER_ID_KEY]) {
    return result[USER_ID_KEY] as string;
  }

  const id = crypto.randomUUID();
  await chrome.storage.local.set({ [USER_ID_KEY]: id });
  return id;
}

/**
 * Returns the stored user ID. Call ensureUserId() first (e.g., on extension install).
 */
export async function getUserId(): Promise<string | null> {
  const result = await chrome.storage.local.get([USER_ID_KEY]);
  return (result[USER_ID_KEY] as string) ?? null;
}
