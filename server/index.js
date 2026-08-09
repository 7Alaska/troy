require("dotenv").config();

const path = require("node:path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const { generateMockupCard } = require("./mockup");

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing SUPABASE_URL or SUPABASE_ANON_KEY in server/.env");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl || "", supabaseServiceKey)
  : null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

async function uploadBuffer(client, buffer, pathName, contentType) {
  const { error } = await client.storage.from("collections").upload(pathName, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = client.storage.from("collections").getPublicUrl(pathName);
  return data.publicUrl;
}

async function saveGalleryImages(client, collectionId, files, thumbnailIndex, slug) {
  const rows = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.mimetype.split("/")[1] || "jpg";
    const imagePath = `${slug}/${Date.now()}-${i}.${ext}`;
    const imageUrl = await uploadBuffer(client, file.buffer, imagePath, file.mimetype);
    rows.push({
      collection_id: collectionId,
      image_path: imagePath,
      image_url: imageUrl,
      sort_order: i,
      is_thumbnail: i === thumbnailIndex,
    });
  }
  const { data, error } = await client.from("collection_images").insert(rows).select("*");
  if (error) throw new Error(error.message);
  return data;
}

async function buildAndUploadMockup(client, thumbnailBuffer, slug) {
  const mockupBuffer = await generateMockupCard(thumbnailBuffer);
  const mockupPath = `${slug}/mockup-${Date.now()}.png`;
  const mockupUrl = await uploadBuffer(client, mockupBuffer, mockupPath, "image/png");
  return { mockupPath, mockupUrl };
}

app.use(cors());
app.use(express.json());

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getBearer(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

async function requireAdmin(req, res, next) {
  try {
    const token = getBearer(req);
    if (!token) return res.status(401).json({ error: "Unauthorized." });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: "Unauthorized." });

    req.user = data.user;
    req.accessToken = token;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized." });
  }
}

function userClient(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    supabase: Boolean(supabaseUrl),
    adminClient: Boolean(supabaseAdmin),
  });
});

app.get("/api/collections", async (_req, res) => {
  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_images(*)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ collections: data ?? [] });
});

app.post("/api/subscribe", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  const { error } = await supabase.from("subscribers").insert({ email });
  if (error) {
    if (error.code === "23505") {
      return res.status(200).json({ ok: true, alreadySubscribed: true });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ ok: true });
});

app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  const client = userClient(req.accessToken);

  const [collectionsRes, publishedRes, subscribersRes] = await Promise.all([
    client.from("collections").select("*", { count: "exact", head: true }),
    client.from("collections").select("*", { count: "exact", head: true }).eq("is_published", true),
    client.from("subscribers").select("*", { count: "exact", head: true }),
  ]);

  if (collectionsRes.error || publishedRes.error || subscribersRes.error) {
    return res.status(500).json({
      error:
        collectionsRes.error?.message ||
        publishedRes.error?.message ||
        subscribersRes.error?.message,
    });
  }

  const { data: recentSubscribers, error: recentError } = await client
    .from("subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  if (recentError) return res.status(500).json({ error: recentError.message });

  res.json({
    totals: {
      collections: collectionsRes.count ?? 0,
      published: publishedRes.count ?? 0,
      subscribers: subscribersRes.count ?? 0,
    },
    recentSubscribers: recentSubscribers ?? [],
  });
});

app.get("/api/admin/collections", requireAdmin, async (req, res) => {
  const client = userClient(req.accessToken);
  const { data, error } = await client
    .from("collections")
    .select("*, collection_images(*)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ collections: data ?? [] });
});

app.post("/api/admin/collections", requireAdmin, upload.array("images", 12), async (req, res) => {
  try {
    const client = userClient(req.accessToken);
    const name = String(req.body?.name ?? "").trim();
    const description = String(req.body?.description ?? "").trim();
    const price = Number(req.body?.price ?? 9);
    const sortOrder = Number(req.body?.sort_order ?? 0);
    const isPublished = String(req.body?.is_published ?? "true") !== "false";
    const slug = slugify(req.body?.slug || name);
    const files = req.files || [];
    const thumbnailIndex = Math.min(
      Math.max(0, Number(req.body?.thumbnail_index ?? 0)),
      Math.max(0, files.length - 1),
    );

    if (!name || !slug) return res.status(400).json({ error: "Name is required." });
    if (files.length === 0) return res.status(400).json({ error: "Upload at least one image." });

    const thumbFile = files[thumbnailIndex];
    const thumbExt = thumbFile.mimetype.split("/")[1] || "jpg";
    const thumbPath = `${slug}/thumb-${Date.now()}.${thumbExt}`;
    const thumbUrl = await uploadBuffer(client, thumbFile.buffer, thumbPath, thumbFile.mimetype);

    const { mockupPath, mockupUrl } = await buildAndUploadMockup(client, thumbFile.buffer, slug);

    const { data, error } = await client
      .from("collections")
      .insert({
        name,
        slug,
        description,
        price,
        sort_order: sortOrder,
        is_published: isPublished,
        image_path: mockupPath,
        image_url: mockupUrl,
        thumbnail_url: thumbUrl,
        mockup_url: mockupUrl,
      })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const images = await saveGalleryImages(client, data.id, files, thumbnailIndex, slug);
    res.status(201).json({ collection: { ...data, collection_images: images } });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Upload failed." });
  }
});

app.patch("/api/admin/collections/:id", requireAdmin, upload.array("images", 12), async (req, res) => {
  try {
    const client = userClient(req.accessToken);
    const id = req.params.id;

    const { data: existing, error: existingError } = await client
      .from("collections")
      .select("*, collection_images(*)")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      return res.status(404).json({ error: "Collection not found." });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (req.body?.name != null) updates.name = String(req.body.name).trim();
    if (req.body?.description != null) updates.description = String(req.body.description).trim();
    if (req.body?.price != null) updates.price = Number(req.body.price);
    if (req.body?.sort_order != null) updates.sort_order = Number(req.body.sort_order);
    if (req.body?.is_published != null) {
      updates.is_published = String(req.body.is_published) !== "false";
    }
    if (req.body?.slug) updates.slug = slugify(req.body.slug);
    else if (updates.name) updates.slug = slugify(updates.name);

    const slug = updates.slug || existing.slug;
    const files = req.files || [];
    let thumbnailBuffer = null;

    // Optional: switch thumbnail among existing gallery
    if (req.body?.thumbnail_image_id) {
      await client
        .from("collection_images")
        .update({ is_thumbnail: false })
        .eq("collection_id", id);

      const { data: thumbRow, error: thumbErr } = await client
        .from("collection_images")
        .update({ is_thumbnail: true })
        .eq("id", req.body.thumbnail_image_id)
        .eq("collection_id", id)
        .select("*")
        .single();

      if (thumbErr) return res.status(400).json({ error: thumbErr.message });

      const response = await fetch(thumbRow.image_url);
      thumbnailBuffer = Buffer.from(await response.arrayBuffer());
      updates.thumbnail_url = thumbRow.image_url;
    }

    if (files.length > 0) {
      const thumbnailIndex = Math.min(
        Math.max(0, Number(req.body?.thumbnail_index ?? 0)),
        files.length - 1,
      );
      await saveGalleryImages(client, id, files, thumbnailIndex, slug);
      thumbnailBuffer = files[thumbnailIndex].buffer;

      const thumbExt = files[thumbnailIndex].mimetype.split("/")[1] || "jpg";
      const thumbPath = `${slug}/thumb-${Date.now()}.${thumbExt}`;
      updates.thumbnail_url = await uploadBuffer(
        client,
        files[thumbnailIndex].buffer,
        thumbPath,
        files[thumbnailIndex].mimetype,
      );
    }

    if (thumbnailBuffer) {
      const { mockupPath, mockupUrl } = await buildAndUploadMockup(client, thumbnailBuffer, slug);
      updates.image_path = mockupPath;
      updates.image_url = mockupUrl;
      updates.mockup_url = mockupUrl;
    }

    const { data, error } = await client
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select("*, collection_images(*)")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ collection: data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Update failed." });
  }
});

app.delete("/api/admin/collections/:id", requireAdmin, async (req, res) => {
  const client = userClient(req.accessToken);
  const id = req.params.id;

  const { data: existing, error: existingError } = await client
    .from("collections")
    .select("*, collection_images(*)")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    return res.status(404).json({ error: "Collection not found." });
  }

  const paths = [
    existing.image_path,
    ...(existing.collection_images || []).map((img) => img.image_path),
  ].filter(Boolean);

  const { error } = await client.from("collections").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });

  if (paths.length) {
    await client.storage.from("collections").remove(paths);
  }

  res.json({ ok: true });
});

app.get("/api/admin/subscribers", requireAdmin, async (req, res) => {
  const client = userClient(req.accessToken);
  const { data, error } = await client
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ subscribers: data ?? [] });
});

// Local/production Node: serve the Vite build. On Vercel, static files come from client/dist.
if (!process.env.VERCEL) {
  app.use(express.static(CLIENT_DIST));
  app.get("/*splat", (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
  });
}

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`troy server listening on http://localhost:${PORT}`);
  });
}
