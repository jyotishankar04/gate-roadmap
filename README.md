# GateTrack

GateTrack is a full-stack Next.js app for GATE CSE 2027 preparation planning and progress tracking. It generates a personalized day-wise roadmap, tracks task progress, supports revision/test workflows, and shows analytics.

## Stack

- Next.js App Router + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS + local shadcn/ui-style components
- React Hook Form-ready validation with Zod server schemas
- bcryptjs password hashing
- signed httpOnly cookie sessions
- Recharts analytics
- light/dark theme support

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
pnpm install
```

4. Generate Prisma client and push schema:

```bash
pnpm db:generate
pnpm db:push
```

5. Seed the GATE CSE 2027 template:

```bash
pnpm db:seed
```

6. Run the app:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Main Features

- Username/password registration and login
- Protected dashboard and roadmap routes
- GATE CSE 2027 roadmap template with detailed subjects, topics, and subtopics
- Personalized day-wise roadmap generation
- Daily task status, notes, and self-rating
- Calendar and subject progress views
- Test attempt tracking
- Weak-topic detection
- Completion, streak, subject, and study-time analytics
- Light and dark theme support

## Database Notes

The schema is template-first:

- `RoadmapTemplate`, `SubjectTemplate`, `TopicTemplate`, and `SubtopicTemplate` define reusable roadmaps.
- `UserRoadmap`, `RoadmapDay`, and `RoadmapTask` store generated user-specific plans permanently.
- Future templates like DSA, NIC Scientist-B, C-DAC Project Engineer, and RBI Grade-B can be added through seed data without changing the tracking model.

## Deployment

### Docker (recommended)

Build and run the full stack (PostgreSQL + app):

```bash
# Set a strong session secret
export SESSION_SECRET="your-long-random-secret-here"

# Build and start
docker compose up -d --build
```

This starts:
- **PostgreSQL 16** on port 5432
- **GateTrack** on port 3000

The entrypoint automatically waits for the database, applies schema changes via `prisma db push`, and starts the Next.js server.

To configure API keys, set the environment variables before starting:

```bash
export OPENAI_API_KEY="sk-..."
export TAVILY_API_KEY="tvly-..."
export SESSION_SECRET="your-long-random-secret"
docker compose up -d --build
```

### Build the image manually

```bash
docker build -t gatetrack .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e SESSION_SECRET="..." \
  gatetrack
```

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | — | JWT signing secret (min 16 chars) |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public app URL |
| `OPENAI_API_KEY` | No | — | OpenAI API key (AI roadmap gen) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model name |
| `TAVILY_API_KEY` | No | — | Tavily search API key |

## Useful Commands

```bash
pnpm lint
pnpm build
pnpm db:studio
```
