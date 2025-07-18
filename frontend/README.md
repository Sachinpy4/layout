# Stall Booking Frontend

A Next.js frontend application for the public stall booking system where exhibitors can browse and book exhibition stalls.

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Update environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   └── ui/             # Shadcn/ui components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── types/              # TypeScript type definitions
└── utils/              # Helper utilities
```

## Features

- 🎨 Modern UI with Shadcn/ui components
- 📱 Responsive design
- 🔒 Authentication system
- 🏪 Exhibition browsing
- 📊 Stall booking system
- 💳 Payment integration
- 📧 Email notifications

## API Integration

The frontend communicates with the NestJS backend API running on `http://localhost:3001/api/v1`.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run type checking: `npm run type-check`
4. Run linting: `npm run lint`
5. Submit a pull request 