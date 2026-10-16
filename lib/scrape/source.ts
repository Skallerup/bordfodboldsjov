/**
 * Single place that talks to the upstream "Bordfodbold Gazette".
 * Everything is fetched as server-rendered HTML (the site exposes no JSON API)
 * and cached with Next.js ISR so we stay polite and the site auto-refreshes.
 */

export const SOURCE = "https://bordfodbold.bypanduro.dk";

/** Revalidate every 30 minutes (see plan: "auto hver ~30 min"). */
export const REVALIDATE_SECONDS = 1800;

export async function fetchPage(path: string): Promise<string> {
  const url = `${SOURCE}${path}`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      // Identify ourselves honestly; we are a sibling fan-site.
      "User-Agent": "bordfodboldsjov (sibling stats site)",
    },
  });
  if (!res.ok) {
    throw new Error(`Kunne ikke hente ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}
