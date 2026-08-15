# ProExergy App (`pe_app`)

ProExergy App is a comprehensive web application for HVAC engineers, researchers, and professionals. It provides a suite of advanced calculation tools and an AI-powered conversational agent to assist with engineering workflows.

## Features

- **AI Agent Interface:** Engage with an intelligent HVAC agent for complex queries, calculations, and data lookups.
- **Psychrometrics:** State Calculator, Cooling Coil, Economizer, Process, and VPD (Vapor Pressure Deficit) calculations.
- **Thermodynamics:** State Calculator, Fluid Info, Glide, and Superheat/Subcooling tools.
- **Thermal Comfort:** Support for various comfort models including NIOSH, PMV-PPD, SET, and UTCI.
- **Unit Conversion:** Quickly convert between various imperial and metric units relevant to thermodynamics.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Remote instance)
- **ORM:** Prisma
- **Styling:** Tailwind CSS & shadcn/ui components
- **Deployment:** Docker & Traefik Reverse Proxy

## Getting Started Locally

First, ensure you have the correct environment variables set up in your `.env.local` file. 

Then, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Documentation & Deployment

For full details on production configurations, Secrets Management, and VPS deployment, please refer to the `README.md` in the `pe_app-deploy` repository/folder.

The application uses an automated Python deployment script (`deploy_pe_app.py`) that handles container rebuilds and database migrations securely on the VPS.
