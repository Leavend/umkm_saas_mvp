# AI Image Editor SaaS

A modern, production‑ready SaaS platform that lets users edit images with AI‑powered tools (background removal, upscaling, smart cropping) while managing credits, payments, and projects.

## ✨ Key Features
- **Secure Authentication** – Email/password and social logins via **NextAuth** (Google, GitHub, etc.).
- **Credit System & Payments** – Integrated with **Polar** for subscription and credit‑pack purchases.
- **AI Image Processing** – Powered by **ImageKit** (storage, optimization, AI transformations).
- **Project Management** – Save, version, and share editing history.
- **Customer Portal** – Invoices, billing details, and credit management.
- **Responsive UI** – Built with **Next.js 15**, **Tailwind CSS**, and **shadcn/ui** components.
- **Server‑less Deployment** – Deploys seamlessly on **Vercel**.

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router + Server Actions), Tailwind CSS, shadcn/ui |
| Backend | NextAuth, Prisma ORM, Neon PostgreSQL |
| Payments | Polar |
| Image Processing | ImageKit |
| Hosting | Vercel |

## 🚀 Getting Started
```bash
# 1. Clone the repo
git clone https://github.com/Leavend/umkm_saas_mvp.git
cd umkm_saas_mvp

# 2. Install dependencies
npm ci   # or `bun install` if you prefer Bun

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in values for Neon, ImageKit, Polar, and NextAuth

# 4. Initialise the database
npx prisma migrate dev --name init

# 5. Run the development server
npm run dev   # or `bun run dev`
```
Open **http://localhost:3000** in your browser.

## 📦 Scripts
| Script | Description |
|--------|-------------|
| `dev` | Starts the Next.js dev server |
| `build` | Builds the app for production |
| `start` | Runs the production build |
| `lint` | Runs ESLint (deprecated in Next.js 15) |
| `format:write` | Formats code with Prettier |
| `format:check` | Checks Prettier formatting |
| `check` | Runs lint + TypeScript type‑check |

## 🤝 Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request. Follow the existing code style (Prettier) and ensure `bun run check` passes.

## 📄 License
This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- **ImageKit** – AI image processing APIs
- **Neon** – Managed PostgreSQL
- **Polar** – Payments & subscriptions
- **NextAuth** – Authentication framework
- **Vercel** – Server‑less hosting platform

---
If you find this project useful, please ⭐ the repository and consider following for more open‑source SaaS projects!
