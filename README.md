# Paw Haven — Animal Adoption

Fresh SAPUI5 + SAP CAP animal adoption demo for SAP Business Application Studio (BAS).

## Run in BAS

Use a Node.js 22+ dev space. Open a terminal at the folder containing `package.json` and run:

```bash
npm install --include=dev
npm run build
npm run watch:ui
```

When the server starts, open the BAS preview and navigate to `/app/pawhaven/webapp/index.html` if the UI does not open automatically.

## Dependency packages

The project declares and installs these npm packages:

- `@sap/cds` — CAP application runtime
- `express` — static UI hosting middleware
- `@cap-js/sqlite` — SQLite database for local development
- `@sap/cds-dk` — CAP CLI and build tooling

SAPUI5 itself is loaded from `https://ui5.sap.com`, so the UI libraries do not need to be included in `node_modules`. The `node_modules` folder is intentionally not tracked by Git; npm creates it during installation.

You can also run `npm run install:all` to install dependencies including development tools.

## Features

- Responsive SAPUI5 interface
- Animal photo cards with search and species filtering
- Adoption request submission backed by CAP OData V4
- Adoption request tracking and demo shelter dashboard
- SQLite database with sample animal data

## Important security note

This project is a development demo. The admin dashboard/status buttons are not protected by production-grade server-side role checks. Add proper authentication, authorization, and production database configuration before deploying it for real users.
