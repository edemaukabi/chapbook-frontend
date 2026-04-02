# Chapbook Frontend

Modern Next.js 15 frontend for the [Chapbook](https://chapbook-api.up.railway.app) publishing platform API.

## Stack

- **Next.js 15** — App Router, TypeScript, SSR/ISR for SEO
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion** — animations and page transitions
- **Axios** — API calls with cookie-based JWT auth
- **TipTap** — rich text editor
- **DOMPurify** — safe HTML rendering
- **Lucide React** — icons
- **Sonner** — toast notifications

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

For production, set `NEXT_PUBLIC_API_URL` to the Railway backend URL in your Vercel project settings.

## Backend

API is at `https://chapbook-api.up.railway.app/api/v1/`  
API docs: `https://chapbook-api.up.railway.app/redoc/`

## Deployment

Deployed on Vercel. Auto-deploys on push to `main`.
