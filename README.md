# 🎨 AI Prompt Shop SaaS

> A modern, full-stack SaaS platform for browsing and purchasing AI image generation prompts with integrated payment system, credit management, and multilingual support.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC)](https://tailwindcss.com/)

## ✨ Key Features

### 🔐 Authentication & User Management
- **NextAuth v4** integration with Google OAuth
- Custom popup-based auth flow for better UX
- Guest session support with automatic migration
- Secure session management with CSRF protection

### 💳 Payment Integration
- **Xendit** payment gateway for IDR transactions
- Credit-based system with package tiers (Starter, Growth, Pro)
- Real-time payment webhooks and verification
- Automatic credit allocation after successful payment

### 🌍 Internationalization (i18n)
- Full bilingual support (English & Indonesian)
- Dynamic language switching
- Internationalized UI components, toast messages, and error handling
- Locale-based routing with `[lang]` parameter

### 🎯 Prompt Marketplace
- Browse AI image generation prompts by category
- Advanced filtering and search functionality
- Copy prompts with credit deduction
- Category-based organization

### 🎨 Modern UI/UX
- Built with **shadcn/ui** components
- Custom top-up modal with package selection
- Responsive design with mobile-first approach
- Toast notifications with Sonner
- Loading states and optimistic updates

### 📊 Credit System
- Credit-based access control
- Daily free credits for registered users
- Package-based credit purchases
- Credit history tracking

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |
| **Zustand** | State management |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Next.js Server Actions** | Server-side mutations |
| **Prisma ORM** | Database ORM |
| **PostgreSQL** | Primary database |
| **NextAuth v4** | Authentication |
| **Xendit SDK** | Payment processing |

### DevOps & Tools
| Technology | Purpose |
|-----------|---------|
| **Bun** | Fast package manager & runtime |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **TypeScript ESLint** | TS-specific linting |

## 📁 Project Structure

```
mvp/
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── src/
│   ├── actions/               # Server actions
│   ├── app/
│   │   ├── [lang]/           # Internationalized routes
│   │   │   ├── auth-success/ # OAuth success page
│   │   │   ├── auth-trigger/ # OAuth trigger page
│   │   │   └── (marketplace)/ # Marketplace pages
│   │   └── api/              # API routes
│   │       ├── auth/         # NextAuth endpoints
│   │       └── xendit/       # Payment webhooks
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth-modal.tsx    # Authentication modal
│   │   ├── top-up-modal.tsx  # Credit purchase modal
│   │   ├── footer.tsx        # Footer component
│   │   └── language-provider.tsx # i18n provider
│   ├── features/
│   │   └── marketplace/      # Marketplace feature
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── auth.ts          # Auth configuration
│   │   ├── i18n.ts          # i18n translations
│   │   ├── constants.ts     # App constants
│   │   └── utils.ts         # Utility functions
│   ├── server/
│   │   ├── auth/            # Auth services
│   │   ├── db.ts            # Prisma client
│   │   └── services/        # Business logic
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript types
├── .env.example             # Environment template
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+** or **Bun 1.0+**
- **PostgreSQL 14+** database
- **Xendit** account for payments
- **Google Cloud** project for OAuth

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Leavend/umkm_saas_mvp.git
   cd umkm_saas_mvp
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   
   # Xendit
   XENDIT_SECRET_KEY="your-xendit-secret"
   XENDIT_WEBHOOK_TOKEN="your-webhook-token"
   
   # ImageKit (optional)
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your-imagekit-key"
   ```

4. **Initialize the database**
   ```bash
   bunx prisma migrate dev
   bunx prisma db seed  # (optional) seed prompts
   ```

5. **Run the development server**
   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with Turbopack |
| `build` | Build for production |
| `start` | Start production server |
| `lint` | Run ESLint |
| `lint:fix` | Fix ESLint errors |
| `format:check` | Check Prettier formatting |
| `format:write` | Format code with Prettier |
| `typecheck` | Run TypeScript type checking |
| `check` | Run lint + typecheck |
| `db:generate` | Generate Prisma client |
| `db:migrate` | Run migrations |
| `db:push` | Push schema to database |
| `db:studio` | Open Prisma Studio |

## 🗄️ Database Schema

### Core Models

**User**
- Authentication and profile data
- Credit balance tracking
- Accounts and sessions (NextAuth)

**GuestSession**
- Temporary sessions for non-registered users
- Credit allocation and tracking
- Auto-migration to User on signup

**Prompt**
- AI image generation prompts
- Category organization
- Search and filter support

**Account & Session**
- NextAuth tables for OAuth
- Multi-provider support

## 🔐 Authentication Flow

### Google OAuth with Custom Popup

```typescript
User clicks "Login with Google"
  ↓
Opens popup window (/auth-trigger)
  ↓
Triggers NextAuth signIn()
  ↓
Google OAuth flow
  ↓
Redirects to /auth-success
  ↓
Sends success message to parent
  ↓
Popup closes, parent refreshes session
```

### Guest Session Migration
- Guest users get 10 free credits
- Credits automatically migrate when signing up
- Session data persists for 7 days

## 💰 Payment Flow

### Credit Purchase

```typescript
User selects package
  ↓
Creates Xendit invoice (/api/xendit/create-invoice)
  ↓
Opens payment page in new tab
  ↓
User completes payment
  ↓
Xendit webhook triggers (/api/xendit/webhook)
  ↓
Credits added to user account
```

### Package Tiers

| Package | Credits | Bonus | Price (IDR) | Discount |
|---------|---------|-------|-------------|----------|
| **Starter** | 11 | +2 | 19,000 | 34% |
| **Growth** | 24 | +11 | 39,000 | 20% |
| **Pro** | 59 | +36 | 89,000 | 10% |

## 🌍 Internationalization

### Supported Languages
- 🇬🇧 English (en)
- 🇮🇩 Indonesian (id)

### Implementation
- All UI text stored in `/src/lib/i18n.ts`
- Dynamic language switching with `LanguageProvider`
- Locale-based routing: `/en/*`, `/id/*`
- Automatic locale detection from browser

## 🎨 UI Components

### Core Components
- **AuthModal** - Google OAuth popup authentication
- **TopUpModal** - Credit purchase interface
- **PromptCard** - Prompt display and purchase
- **LanguageSwitcher** - Language toggle
- **Footer** - Internationalized footer

### shadcn/ui Components
- Dialog, Button, Badge, Tooltip
- Custom styling with Tailwind CSS
- Accessible by default

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set all required environment variables in Vercel dashboard or via CLI.

### Database
- Use **Neon**, **Supabase**, or any PostgreSQL provider
- Run migrations before deployment
- Set up connection pooling for production

## 📝 Development Guidelines

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Write type-safe TypeScript
- Use Server Actions for mutations

### Component Structure
```typescript
// Component file structure
"use client" // if client component

import { ... } from "..."

interface ComponentProps {
  // Props definition
}

export function Component({ ...props }: ComponentProps) {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    // JSX
  )
}
```

### API Routes
```typescript
// Use Next.js App Router conventions
export async function POST(request: Request) {
  // Validation
  // Business logic
  // Response
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/config changes

## 🐛 Known Issues

- [ ] Guest session cleanup job not implemented
- [ ] Webhook retry mechanism needed
- [ ] Email notifications for payments pending

## 🗺️ Roadmap

- [ ] Email/password authentication
- [ ] Prompt favorites and collections
- [ ] User-generated prompts
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] API rate limiting
- [ ] CDN integration for images

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework
- **Prisma** - Next-generation ORM
- **NextAuth** - Authentication for Next.js
- **Xendit** - Payment gateway for Indonesia
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Vercel** - Deployment platform

## 📧 Contact

**Project Maintainer:** Tio Hady Pranoto  
**Organization:** Bontang Techno Hub  
**Product:** UMKMJaya Prompt Shop

---

<div align="center">
  
**⭐ Star this repository if you find it useful!**

Made with ❤️ for the UMKM community in Indonesia

</div>
