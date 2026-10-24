# BAS setup and SAP HANA Cloud deployment

## A. Start locally first

1. Open the `Paw-Haven` folder in an SAP CAP dev space with Node.js 22+.
2. Open **Terminal → New Terminal** at the folder containing `package.json`.
3. Run:

   ```bash
   git pull origin main
   npm install --include=dev
   npm run watch:ui
   ```

4. Open the BAS preview. Use `/app/pawhaven/webapp/index.html` for local preview.
5. Local mode uses SQLite and development mock users.

## B. Prepare the BTP account

Before deployment, make sure all of these exist:
- Cloud Foundry environment, org, and space in the same BTP subaccount
- SAP HANA Cloud database provisioned and running
- Entitlement for `hana / hdi-shared`
- Entitlement for `xsuaa / application`
- Cloud Foundry CLI v8+, Cloud MTA Build Tool (`mbt`), and the MultiApps CF plugin

Check the tooling:

```bash
cf -v
mbt --version
```

If `mbt` is missing and npm global installs are allowed in the dev space, try `npm install -g mbt`. Install the CF MultiApps plugin using the current SAP/CAP deployment guide.

## C. Build and deploy to SAP HANA Cloud

At the project root:

```bash
npm install --include=dev
npm install --package-lock-only
```

Log in with the Cloud Foundry API endpoint shown in the BTP cockpit. Do not guess the endpoint:

```bash
cf login --sso -a <YOUR-CF-API-ENDPOINT>
cf target -o <YOUR-ORG> -s <YOUR-SPACE>
```

Build and deploy:

```bash
mbt build -t gen --mtar paw-haven.mtar
cf deploy gen/paw-haven.mtar -f
```

When deployment completes:

```bash
cf apps
```

Open the route for `paw-haven-router` and use the `/index.html` welcome page. The router requires BTP sign-in and routes OData requests to CAP with the user's token. The database deployer creates CAP's database objects in the HANA HDI container.

## Troubleshooting

- **Blank UI in the old BAS preview:** pull `main`, stop the existing `cds watch` task, restart with `npm run watch:ui`, then hard-refresh the browser. The UI5 bootstrap was corrected to use the standard ComponentSupport entry module and resource-root attribute.
- **HANA or HDI resource creation fails:** verify the HANA Cloud database is running and that `hana / hdi-shared` is entitled in the correct subaccount and space.
- **XSUAA resource creation fails:** verify `xsuaa / application` is entitled.
- **`cf deploy` is unknown:** install the CF MultiApps plugin.
- **`mbt` is unknown:** install the Cloud MTA Build Tool; see SAP's current deployment documentation.
- **App shows sign-in but OData fails:** inspect `cf logs paw-haven-adoption-srv --recent` and confirm the app is bound to both the HANA HDI and XSUAA services.
- **npm install fails:** verify internet access from BAS to npmjs.org and share the full terminal output.

## Security note

The login is managed by BTP/XSUAA after deployment. Admin approval and rejection actions are still demo functionality and are not protected by server-side role authorization. Do not use this version with real applicant data until role checks are implemented.
