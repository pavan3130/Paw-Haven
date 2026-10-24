# Paw Haven — Animal Adoption (SAPUI5 + CAP)

A clean starter project featuring a responsive SAPUI5 interface, CAP OData V4 backend, SQLite development database, seeded animal listings, adoption request submission, and a simple demo administration tab.

> **Demo scope:** The supplied mock users are for local development only. The UI presents a demo admin panel and does not enforce admin-only front-end routes. Do not deploy this demo with mock authentication or demo credentials to production.

## Requirements
- Node.js 22 or newer
- npm
- Internet access to load SAPUI5 from `https://ui5.sap.com` and animal photos from Unsplash

## Run in SAP Business Application Studio
```bash
npm install
npm run build
npm run watch:ui
```
Open the BAS preview link. If needed, browse to `/app/pawhaven/webapp/index.html`.

## Local demo users
- Admin: `admin@example.com` / `admin`
- User: `pavan@example.com` / `pavan`

Mock authentication may prompt for credentials depending on your CAP setup. These are sample credentials only.

## Features
- SAP Horizon theme and responsive UI
- Animal cards with photographs, species filter, and text search
- Adoption request dialog and OData action
- Requests tab and status updates
- Demo administration overview and approve/reject actions
- CAP OData V4 service at `/odata/v4/adoption`
- SQLite persistence for local development

## API
- `GET /odata/v4/adoption/Animals`
- `GET /odata/v4/adoption/AdoptionRequests?$expand=animal`
- `POST /odata/v4/adoption/submitAdoption`

## Notes
- Animal photos use remote URLs.
- This is a fresh implementation separate from the old `animal-adoption` repository.
- Before production, implement real authentication/authorization, server-side permission checks, a production database, and end-to-end testing.
