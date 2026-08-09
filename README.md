# troy

Marketing site + admin for troy, a digital wallpaper shop for MacBook and iPhone.

## Stack

- `client/` - React 19 + Vite + Tailwind CSS v4 + Motion + Supabase Auth
- `server/` - Node.js + Express API
- Supabase - Postgres (`collections`, `subscribers`) + Storage bucket `collections`

Project: `https://llqmrdskeymxhzgbnxeh.supabase.co`

## Setup

1. Copy env files (already filled for this project):

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

2. In Supabase Dashboard → **Authentication → Providers → Email**:
   - Turn **Confirm email** OFF for local admin signup (or confirm via inbox)

3. Install and run:

```bash
npm install
npm run dev --prefix client
# and
npm run dev --prefix server
# or from root:
npm run dev
```

- Storefront: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`

## Admin

1. Open `/admin`
2. Create your first account (Sign up)
3. Upload collections (image → Supabase Storage)
4. View overview counts + subscriber list

## API

| Method | Path | Auth |
|---|---|---|
| GET | `/api/collections` | public |
| POST | `/api/subscribe` | public |
| GET | `/api/admin/stats` | Bearer |
| GET/POST | `/api/admin/collections` | Bearer |
| PATCH/DELETE | `/api/admin/collections/:id` | Bearer |
| GET | `/api/admin/subscribers` | Bearer |

## Build

```bash
npm run build
npm start
```
