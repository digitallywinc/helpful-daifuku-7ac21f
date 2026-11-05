# HelpDesk AI — Demo Setup

> **Demo-only setup:** You do not need a Supabase project, Supabase keys, or an OpenAI API key. The app uses its built-in mock/demo data and fallback assistant. Demo data is held in the backend's memory and resets when the backend restarts.

## Run locally in VS Code (Windows)

1. Open this `helpdesk-ai` folder in VS Code.
2. Open Terminal → New Terminal and install both apps:

   ```powershell
   npm.cmd run install:all
   ```

3. Open a second terminal and start the demo backend:

   ```powershell
   npm.cmd run dev:server
   ```

   Keep this terminal open. The API runs at `http://localhost:3001`.

4. In a third terminal, start the frontend:

   ```powershell
   npm.cmd run dev:client
   ```

5. Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

Use the built-in **Try Demo / Demo Login** options on the sign-in screen. The sample accounts in the demo store are `customer@example.com` and `admin@helpdesk.ai`; use the app's demo login buttons if available rather than relying on a real password.

## Build check

From the project root, run:

```powershell
npm.cmd run build
```

## Important deployment note

This is a two-part app: the React frontend (`client`) and the Express API (`server`). Netlify static hosting can publish the frontend, but it does **not** run this Express server automatically. If you publish only `client/dist`, the UI may load while API-backed demo features fail unless the Express server is also hosted somewhere and `VITE_API_URL` points to that server. No Supabase connection is required for demo mode.

---

# HelpDesk AI — Intelligent Customer Support System

A production-grade, full-stack, AI-powered customer support platform designed for modern SaaS enterprises. HelpDesk AI combines **real-time AI conversational support** grounded with **Knowledge Base FAQs (RAG)**, a **robust ticket triage and escalation pipeline**, and a dedicated **Administrator Operations Suite** with PostgreSQL Row Level Security (RLS).

---

## Architecture Overview

```
                      +------------------------------------------+
                      |         React + Vite + TypeScript        |
                      |   Tailwind CSS + shadcn/ui Components    |
                      +--------------------+---------------------+
                                           |
                              HTTP / REST API Requests
                           (Bearer JWT Token Auth)
                                           v
                      +------------------------------------------+
                      |       Node.js + Express.js Backend       |
                      |  Rate Limiting - Helmet - Authentication |
                      +---------+--------------------+-----------+
                                |                    |
          Supabase JWT /        |                    |  RAG FAQ Grounding
          RLS Enforcement       |                    |  GPT-4o / GPT-4o-mini
                                v                    v
                      +-------------------+  +-------------------+
                      |     Supabase      |  |    OpenAI API     |
                      | PostgreSQL + Auth |  |  Customer Support |
                      |    Row Security   |  |   Conversations   |
                      +-------------------+  +-------------------+
```

---

## Key Features

### 1. 24/7 AI Customer Support Chatbot
- **Real-Time Interactive AI**: Delivers conversational answers with markdown formatting (bullet points, bold text, steps).
- **FAQ Knowledge Base Grounding (RAG)**: Injects published FAQs into context dynamically to eliminate hallucinations.
- **Smart Escalation**: If the inquiry requires manual account adjustments or internal review, the AI assistant recommends opening a support ticket and provides a one-click **"Create Support Ticket"** action.
- **Persistent Chat History**: All conversations and messages are persisted in Supabase with timestamps and session titles.
- **Graceful Fallback Mode**: If `OPENAI_API_KEY` is not provided, an intelligent built-in expert assistant answers common questions seamlessly so reviewers can test the application immediately.

### 2. Comprehensive Support Ticket Management
- **Structured Categories**: Technical Support, Account Issues, Billing, General Questions, Other.
- **Priority Matrix**: Low, Medium, High, Urgent.
- **Lifecycle Tracking**: Open &rarr; In Progress &rarr; Waiting for Customer &rarr; Resolved &rarr; Closed.
- **Automated Reference Codes**: Unique sequential identifiers (e.g., `TICK-1001`).
- **Interactive Discussion Thread**: Customers and administrators can post threaded follow-ups, with status transitions and instant notification alerts.

### 3. Administrator Operations Dashboard
- **Operational Metrics**: Real-time counters for Total Tickets, Open Queue, In Progress Cases, Resolved Tickets, and Registered Customers.
- **Visual Analytics**: Interactive breakdowns by Category and Priority.
- **Administrative Ticket Triage**: Search, filter by status/priority/category/assignment, sort, and execute fast inline status updates.
- **Staff Internal Notes**: Admins can write confidential notes on tickets that remain invisible to customers.
- **Customer Directory**: Inspect registered users, assigned roles, and total ticket history.
- **AI Conversation Review Logs**: Review all customer AI chat logs to monitor response quality.

### 4. Knowledge Base & FAQ Management
- **Public Customer Portal**: Categorized and searchable accordion knowledge base with helpfulness feedback votes.
- **Admin Management Studio**: Create, update, publish, or draft FAQ articles, which are instantly indexed by the AI Chatbot.

### 5. Enterprise Security & Database Architecture
- **Supabase PostgreSQL Database**: Complete relational schema with UUID primary keys, foreign keys, and indexes.
- **Row Level Security (RLS)**: Enforces access control at the database level: customers can only view and update their own tickets/conversations; administrators have scoped elevated privileges.
- **Backend API Token Verification**: Every protected endpoint validates Supabase JWT Bearer tokens and checks the genuine role in `public.profiles`.
- **API Rate Limiting & Helmet Headers**: Protects AI endpoints against spam and protects against common HTTP vulnerabilities.
- **Zero Key Exposure**: OpenAI secret keys and Supabase service role keys reside strictly on the server.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui patterns, Lucide React, Axios, date-fns |
| **Backend** | Node.js, Express.js, TypeScript, Helmet, Morgan, Express-Rate-Limit, Zod |
| **Database & Auth** | Supabase PostgreSQL, Supabase Authentication, Row Level Security (RLS) |
| **AI Integration** | OpenAI API (`gpt-4o-mini` / `gpt-4o`) with RAG Knowledge Base injection |

---

## Project Structure

```
helpdesk-ai/
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # StatsCard, FaqModal
│   │   │   ├── auth/                # ProtectedRoute, AdminRoute
│   │   │   ├── chat/                # ChatWindow, ChatMessage, ConversationList
│   │   │   ├── layout/              # Sidebar, Navbar, NotificationDrawer, DashboardLayout
│   │   │   ├── tickets/             # TicketCard, TicketFilter, TicketTimeline, ReplyBox
│   │   │   └── ui/                  # Button, Input, Textarea, Select, Badge, Card, Dialog, Avatar
│   │   ├── contexts/                # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/               # AdminDashboard, AdminTickets, AdminTicketDetail, AdminFaqs, Customers
│   │   │   ├── auth/                # Login, Register, ForgotPassword
│   │   │   └── customer/            # Dashboard, AiChat, Tickets, CreateTicket, TicketDetail, FAQs, Profile
│   │   ├── services/                # api.ts (Axios REST client), supabase.ts
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── utils/                   # cn utility
│   │   ├── App.tsx                  # Application Routes
│   │   ├── index.css                # Tailwind CSS + HSL Theme Variables
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                          # Express.js REST API Backend
│   ├── src/
│   │   ├── config/                  # env.ts, supabase.ts, openai.ts
│   │   ├── controllers/             # authController, chatController, ticketController, adminController, faqController
│   │   ├── middleware/              # auth.ts, rateLimiter.ts, errorHandler.ts, validate.ts
│   │   ├── routes/                  # authRoutes, chatRoutes, ticketRoutes, adminRoutes, faqRoutes
│   │   ├── services/                # aiService.ts, chatService.ts, ticketService.ts, faqService.ts, store.ts
│   │   ├── types/                   # Backend TypeScript interfaces
│   │   └── server.ts                # Express app setup and middleware pipeline
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/
│   └── migrations/
│       ├── 20261105000000_init_schema.sql  # Complete schema, triggers, RLS policies
│       └── 20261105000001_seed_data.sql    # Seed knowledge base FAQs
│
├── .gitignore
├── package.json                     # Root orchestrator scripts
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** v18+ or v20+ installed
- **npm** or **pnpm** installed
- Optional: Supabase account (free at [supabase.com](https://supabase.com))
- Optional: OpenAI API Key (at [platform.openai.com](https://platform.openai.com))

> **Note**: HelpDesk AI includes an automated **Demo & Portfolio Mode**. If you run the project without setting up external Supabase or OpenAI credentials, the application functions seamlessly using pre-seeded customer and admin accounts, in-memory state, and intelligent simulated AI responses!

---

### Step 1: Install Dependencies

From the root directory:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### Step 2: Configure Environment Variables

#### Backend Configuration (`server/.env`):
Copy `server/.env.example` to `server/.env`:
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase (Found in Project Settings -> API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# OpenAI API Key
OPENAI_API_KEY=sk-proj-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

#### Frontend Configuration (`client/.env`):
Copy `client/.env.example` to `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

---

### Step 3: Supabase Database Setup

1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Copy the contents of `supabase/migrations/20261105000000_init_schema.sql` and run the script. This creates:
   - `profiles` table (automatically synchronized on signup via trigger `handle_new_user`)
   - `conversations` & `messages` tables
   - `tickets` & `ticket_replies` tables
   - `faqs` table
   - `notifications` table
   - Formatted ticket sequence generator (`TICK-1001`, `TICK-1002`, etc.)
   - Full Row Level Security (RLS) policies for customers and administrators.
4. Copy and run `supabase/migrations/20261105000001_seed_data.sql` to populate initial Knowledge Base FAQs.

---

### Step 4: Running the Application

Open two terminal windows:

#### Terminal 1 — Start REST API Backend:
```bash
cd server
npm run dev
```
Backend will start on: `http://localhost:3001` (Health: `http://localhost:3001/api/health`)

#### Terminal 2 — Start Frontend:
```bash
cd client
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`

---

## Instant One-Click Demo Mode

For portfolio presentation and fast evaluation without entering database credentials, the Login screen (`/login`) includes **One-Click Demo Shortcuts**:
- **Customer Demo**: Logs in as `Alex Customer` with active tickets, chat history, and notification center access.
- **Admin Demo**: Logs in as `Sarah Jenkins (Lead Admin)` with access to the Operations Dashboard, Ticket Triage, FAQ Management Studio, Customer Directory, and AI Conversation Review Logs.

---

## REST API Specification

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | Public |
| `GET` | `/api/auth/profile` | Current user profile | Bearer Token |
| `PUT` | `/api/auth/profile` | Update profile settings | Bearer Token |
| `GET` | `/api/chat/conversations` | List user chat sessions | Bearer Token |
| `GET` | `/api/chat/conversations/:id` | Get session transcript | Bearer Token |
| `POST` | `/api/chat/message` | Send message to AI Assistant | Bearer Token (Rate limited) |
| `DELETE` | `/api/chat/conversations/:id` | Delete conversation | Bearer Token |
| `GET` | `/api/tickets` | List user support tickets | Bearer Token |
| `POST` | `/api/tickets` | Submit new support ticket | Bearer Token |
| `GET` | `/api/tickets/:id` | Ticket details and thread | Bearer Token |
| `POST` | `/api/tickets/:id/replies` | Add reply to ticket | Bearer Token |
| `PATCH` | `/api/tickets/:id/status` | Update ticket status | Bearer Token |
| `GET` | `/api/faqs` | Search published FAQs | Public |
| `GET` | `/api/notifications` | User notifications | Bearer Token |
| `PATCH` | `/api/notifications/:id/read` | Mark notification read | Bearer Token |
| `GET` | `/api/admin/dashboard` | Queue metrics and breakdown | Admin Bearer Token |
| `GET` | `/api/admin/tickets` | View all system tickets | Admin Bearer Token |
| `PATCH` | `/api/admin/tickets/:id` | Reassign / update ticket | Admin Bearer Token |
| `GET` | `/api/admin/customers` | Registered customer list | Admin Bearer Token |
| `GET` | `/api/admin/conversations` | Review AI support logs | Admin Bearer Token |
| `POST` | `/api/admin/faqs` | Create new FAQ article | Admin Bearer Token |
| `PATCH` | `/api/admin/faqs/:id` | Update FAQ article | Admin Bearer Token |
| `DELETE` | `/api/admin/faqs/:id` | Delete FAQ article | Admin Bearer Token |

---

## Security Best Practices Implemented

1. **Role-Based Authorization (RBAC)**: Validated on every administrative route on the server and guarded via frontend route guards.
2. **Server-Side Token Verification**: Uses Supabase Auth tokens to cryptographically verify user identity.
3. **Database-Level Protection**: Supabase Row Level Security (RLS) ensures users cannot inspect or modify records belonging to other tenants.
4. **Input Sanitization**: Express body parsers and request parameter sanitization prevent injection attacks.
5. **Rate Limiting**: Multi-tier rate limiting protects AI endpoints against automated abuse.
6. **No Client-Side Secrets**: Service role keys and OpenAI API credentials are restricted strictly to backend environment variables.

---

## Author & Portfolio Presentation

Built by a Senior Full-Stack Developer to demonstrate end-to-end software architecture, responsive UI design, relational database modeling, and real-world AI agent integration.


## Deploying the complete demo to Netlify

This project is configured to deploy both the Vite frontend and the Express API as a Netlify Function.

1. Upload the **entire project folder** to a GitHub repository (keep `client`, `server`, `netlify`, `netlify.toml`, and the root `package.json`).
2. In Netlify, choose **Add new site → Import an existing project** and connect that repository.
3. Netlify should detect `netlify.toml`. Confirm the publish directory is `client/dist` and the functions directory is `netlify/functions`.
4. Deploy. The build installs and builds the server and client; `/api/*` is routed to the Express function and React routes such as `/login` and `/dashboard` use the SPA fallback.
5. For the built-in portfolio demo, no Supabase or OpenAI keys are required. Demo data is held in the server's in-memory store, so it is intended for demonstrations and may reset when a serverless instance restarts.

### Demo accounts

- Customer: click **Customer Demo** on the login page.
- Administrator: click **Admin Demo** on the login page.

The demo shortcuts use local demo tokens and then call the deployed API for dashboard data. Real email/password authentication, shared persistent data, and AI responses require configuring the appropriate Supabase and OpenAI environment variables in Netlify.

### Netlify environment variables for connected services (optional)

Set these in **Site configuration → Environment variables** when connecting real services:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose this as a `VITE_` variable)
- `OPENAI_API_KEY` (server only)
- `OPENAI_MODEL` (optional; defaults to `gpt-4o-mini`)
- `CLIENT_URL` (your deployed Netlify site URL)

Do not commit real API keys to GitHub.
