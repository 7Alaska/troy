import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "./AuthContext";
import type { CollectionRow } from "../lib/supabase";

type CollectionImage = {
  id: string;
  image_url: string;
  is_thumbnail: boolean;
  sort_order: number;
};

type CollectionWithImages = CollectionRow & {
  collection_images?: CollectionImage[];
  mockup_url?: string | null;
  thumbnail_url?: string | null;
};

const emptyForm = {
  name: "",
  description: "",
  price: "9",
  sort_order: "0",
  is_published: true,
};

export function AdminCollections() {
  const { accessToken } = useAuth();
  const [collections, setCollections] = useState<CollectionWithImages[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [existingThumbId, setExistingThumbId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const editingItem = useMemo(
    () => collections.find((c) => c.id === editingId) ?? null,
    [collections, editingId],
  );

  async function load() {
    if (!accessToken) return;
    const res = await fetch("/api/admin/collections", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load collections");
    setCollections(data.collections ?? []);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [accessToken]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function startEdit(item: CollectionWithImages) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      sort_order: String(item.sort_order),
      is_published: item.is_published,
    });
    setFiles([]);
    setThumbnailIndex(0);
    const thumb = item.collection_images?.find((img) => img.is_thumbnail);
    setExistingThumbId(thumb?.id ?? item.collection_images?.[0]?.id ?? null);
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFiles([]);
    setThumbnailIndex(0);
    setExistingThumbId(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setLoading(true);
    setError("");

    try {
      if (!editingId && files.length === 0) {
        throw new Error("Upload at least one image.");
      }

      const body = new FormData();
      body.append("name", form.name);
      body.append("description", form.description);
      body.append("price", form.price);
      body.append("sort_order", form.sort_order);
      body.append("is_published", String(form.is_published));
      body.append("thumbnail_index", String(thumbnailIndex));
      if (editingId && existingThumbId && files.length === 0) {
        body.append("thumbnail_image_id", existingThumbId);
      }
      files.forEach((file) => body.append("images", file));

      const url = editingId
        ? `/api/admin/collections/${editingId}`
        : "/api/admin/collections";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!accessToken) return;
    if (!confirm("Delete this collection and its images?")) return;

    const res = await fetch(`/api/admin/collections/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h1 className="text-2xl font-semibold">
          {editingId ? "Edit collection" : "Upload collection"}
        </h1>
        <p className="mt-1 text-sm text-mute">
          Upload multiple wallpapers, pick a thumbnail, and a laptop mockup is generated automatically.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 border border-line bg-panel p-5">
          <div>
            <label className="text-xs text-mute" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-2 w-full border border-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-frost/60"
            />
          </div>

          <div>
            <label className="text-xs text-mute" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-2 w-full border border-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-frost/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-mute" htmlFor="price">
                Price (EUR)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-2 w-full border border-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-frost/60"
              />
            </div>
            <div>
              <label className="text-xs text-mute" htmlFor="sort">
                Sort order
              </label>
              <input
                id="sort"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                className="mt-2 w-full border border-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-frost/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-mute" htmlFor="images">
              Images {editingId ? "(add more)" : `(${files.length}/12)`}
            </label>
            <input
              id="images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => {
                const next = Array.from(e.target.files ?? []);
                if (next.length === 0) return;
                setFiles((prev) => {
                  const merged = [...prev, ...next].slice(0, 12);
                  return merged;
                });
                e.target.value = "";
              }}
              className="mt-2 block w-full text-sm text-mute file:mr-3 file:border file:border-line file:bg-ink file:px-3 file:py-1.5 file:text-bone"
            />
            <p className="mt-1 text-xs text-mute">
              Select multiple at once, or add more in another pick. Max 12.
            </p>
          </div>

          {previews.length > 0 && (
            <div>
              <p className="text-xs text-mute">
                Click to set thumbnail. {files.length} selected.
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className={`relative overflow-hidden border ${
                      thumbnailIndex === i ? "border-frost" : "border-line"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setThumbnailIndex(i)}
                      className="block w-full"
                    >
                      <img src={src} alt="" className="aspect-square w-full object-cover" />
                      {thumbnailIndex === i && (
                        <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-[10px] uppercase tracking-wide text-frost">
                          Thumbnail
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => {
                        setFiles((prev) => {
                          const next = prev.filter((_, idx) => idx !== i);
                          setThumbnailIndex((t) => {
                            if (next.length === 0) return 0;
                            if (t === i) return 0;
                            if (t > i) return t - 1;
                            return t;
                          });
                          return next;
                        });
                      }}
                      className="absolute right-1 top-1 bg-ink/80 px-1.5 text-xs text-bone"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editingItem?.collection_images && editingItem.collection_images.length > 0 && files.length === 0 && (
            <div>
              <p className="text-xs text-mute">Or pick thumbnail from existing images</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {editingItem.collection_images
                  .slice()
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setExistingThumbId(img.id)}
                      className={`relative overflow-hidden border ${
                        existingThumbId === img.id ? "border-frost" : "border-line"
                      }`}
                    >
                      <img src={img.image_url} alt="" className="aspect-square w-full object-cover" />
                      {existingThumbId === img.id && (
                        <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-[10px] uppercase tracking-wide text-frost">
                          Thumbnail
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-mute">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
            />
            Published on storefront
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-bone px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
            >
              {loading ? "Generating mockup..." : editingId ? "Update" : "Upload"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-line px-4 py-2.5 text-sm text-mute"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-medium">All collections</h2>
        <div className="mt-4 space-y-3">
          {collections.length === 0 ? (
            <p className="text-sm text-mute">No collections yet. Upload the first one.</p>
          ) : (
            collections.map((item) => (
              <div key={item.id} className="flex gap-4 border border-line bg-panel p-3">
                <img
                  src={item.mockup_url || item.image_url}
                  alt={item.name}
                  className="h-24 w-18 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-mute">
                        &euro;{Number(item.price).toFixed(2)} ·{" "}
                        {item.is_published ? "Published" : "Draft"} ·{" "}
                        {item.collection_images?.length ?? 0} images
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-xs text-mute hover:text-bone"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-mute">{item.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
