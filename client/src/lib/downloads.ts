const STORAGE_KEY = "troy-download-tokens";

type TokenMap = Record<string, string>;

function readTokens(): TokenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TokenMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getDownloadToken(slug: string): string | null {
  return readTokens()[slug] ?? null;
}

export function saveDownloadToken(slug: string, token: string) {
  const next = { ...readTokens(), [slug]: token };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function downloadImages(
  images: Array<{ url: string; filename: string }>,
) {
  for (const image of images) {
    try {
      const res = await fetch(image.url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(image.url, "_blank", "noopener,noreferrer");
    }
  }
}
