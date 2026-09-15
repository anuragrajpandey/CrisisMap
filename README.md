# CrisisMap

AI-powered real-time incident & relief intelligence platform.

## Frontend MVP

This repository currently contains the CrisisMap frontend prototype, designed around the live incident intelligence experience:

- Live incident map dashboard
- Incident severity filters
- Recent incidents and nearby services
- Incident detail drawer
- Citizen incident reporting modal
- Relief/NGO connection surface
- Responsive layout for desktop and tablet

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The current map is a UI prototype with seeded incident data. The architecture is intentionally ready for the planned Spring Boot + PostgreSQL/PostGIS API and SSE live-update layer.
