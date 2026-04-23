# InsectCV Data Collection Pipeline

A prototype data collection system for training computer vision models to differentiate harmful vs harmless insects in agricultural settings.

## Features

- **Image & Video Capture Management** - Upload and organize captures from field cameras
- **Manual Annotation** - Classify insects as harmful, harmless, or unknown with bounding boxes
- **Environmental Metadata** - Track temperature, humidity, wind conditions with each capture
- **Area Management** - Define GPS-based monitoring zones
- **Device Tracking** - Register and monitor IoT camera devices
- **ML Dataset Export** - Export annotated data in COCO, YOLO, and other formats

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Media Storage**: Cloudinary
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Vercel Postgres)
- Cloudinary account

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment example and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database (Vercel Postgres)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
```

3. Generate Prisma client and push schema to database:

```bash
npm run db:generate
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── page.tsx          # Main dashboard
│   │   ├── captures/         # Capture gallery & detail
│   │   ├── upload/           # Upload interface
│   │   ├── areas/            # Area management
│   │   ├── devices/          # Device management
│   │   └── exports/          # Dataset exports
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # Base UI components
│   ├── layout/               # Layout components
│   ├── dashboard/            # Dashboard widgets
│   ├── captures/             # Capture components
│   ├── annotations/          # Annotation components
│   ├── upload/               # Upload components
│   ├── areas/                # Area components
│   └── exports/              # Export components
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── utils.ts              # Utility functions
│   ├── cloudinary.ts         # Cloudinary config
│   ├── constants.ts          # App constants
│   └── validations/          # Zod schemas
├── prisma/
│   └── schema.prisma         # Database schema
└── types/                    # TypeScript types
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Database Schema

### Core Models

- **Area** - Monitoring locations with GPS coordinates
- **Device** - IoT camera devices
- **Capture** - Images/videos with environmental metadata
- **Annotation** - Classification labels with bounding boxes
- **Export** - ML training dataset exports

### Enums

- **MediaType**: IMAGE, VIDEO
- **Classification**: HARMFUL, HARMLESS, UNKNOWN
- **CaptureStatus**: PENDING, ANNOTATED, VERIFIED, EXPORTED, REJECTED
- **ExportFormat**: COCO, YOLO, PASCAL_VOC, CSV, RAW

## Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Create an unsigned upload preset:
   - Go to Settings > Upload
   - Add upload preset
   - Set signing mode to "Unsigned"
   - Configure folder as "insect-captures"
3. Copy your cloud name, API key, API secret, and upload preset name to `.env.local`

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

The application will automatically:
- Generate Prisma client on build
- Connect to Vercel Postgres

## License

MIT
