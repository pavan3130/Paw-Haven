# Paw Haven — Animal Adoption

Fresh SAPUI5 + SAP CAP animal-adoption demo prepared for SAP Business Application Studio (BAS), with SQLite for local development and SAP HANA Cloud for Cloud Foundry deployment.

## 1. Run locally in BAS

Use a Node.js 22+ dev space. Open a terminal in the folder containing `package.json`:

```bash
git pull origin main
npm install --include=dev
npm run watch:ui
```

Open the BAS preview link. The local UI URL is `/app/pawhaven/webapp/index.html`. Local development uses SQLite and the mock users configured in `package.json`.

## 2. Deploy to SAP HANA Cloud on BTP

This project deploys the CAP backend to Cloud Foundry, a HANA HDI container for database objects, an XSUAA service for sign-in, and an AppRouter that serves the UI and forwards OData calls.

### Prerequisites

- SAP BTP Cloud Foundry org and space
- SAP HANA Cloud database provisioned and running in the same BTP subaccount
- Entitlement for the `hana / hdi-shared` and `xsuaa / application` service plans
- Cloud Foundry CLI v8+ logged in to the target space
- Cloud MTA Build Tool (`mbt`) and the CF MultiApps plugin

### Build and deploy

From the project root:

```bash
npm install --include=dev
npm install --package-lock-only
```

Log in using the API endpoint shown in your BTP cockpit under Cloud Foundry Environment:

```bash
cf login --sso -a <YOUR-CF-API-ENDPOINT>
cf target -o <YOUR-ORG> -s <YOUR-SPACE>
```

Build and deploy the MTA:

```bash
mbt build -t gen --mtar paw-haven.mtar
cf deploy gen/paw-haven.mtar -f
```

After deployment, run `cf apps` and open the route belonging to `paw-haven-router`. The AppRouter welcome page is `/index.html`. Do not open the internal CAP service route as your main website; the AppRouter handles XSUAA login and forwards the authentication token to the backend.

If `mbt` or the `cf deploy` command is not found, install the Cloud MTA Build Tool and the CF MultiApps plugin in your BAS terminal. SAP's deployment guide is linked below.

## Dependencies and configuration

- `@sap/cds`: CAP Node.js runtime
- `@cap-js/sqlite`: SQLite database for development
- `@cap-js/hana`: SAP HANA Cloud database service for production
- `@sap/xssec`: XSUAA/JWT authentication integration for production
- `@sap/cds-dk`: CAP CLI and build tooling
- `@sap/approuter`: sign-in and routing for the deployed UI
- `express`: static UI hosting during local development

UI5 is loaded from `https://ui5.sap.com`, so UI5 libraries are not copied into `node_modules`.

Database and authentication are profile-specific: development uses SQLite and mock users; production uses HANA and XSUAA. The repository contains an `mta.yaml` descriptor and an `app/router` module for deployment.

## Demo scope and security

This is a learning/demo application, not production-finished. The production router requires BTP sign-in, but admin approval/rejection actions are not yet protected by server-side role-based authorization. All authenticated users currently reach the same CAP service permissions. Add backend authorization checks before using it with real applicants or sensitive data.

## Official deployment guide

https://cap.cloud.sap/docs/guides/deploy/to-cf
