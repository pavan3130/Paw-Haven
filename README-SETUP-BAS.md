# BAS setup quick steps

1. Open the project folder in a BAS dev space with Node.js support.
2. In a terminal at the project root, verify Node.js 22+ with `node -v` and `npm -v`.
3. Install and build:
   ```bash
   npm install --include=dev
   npm run build
   ```
4. Start the app:
   ```bash
   npm run watch:ui
   ```
5. Open the BAS preview at `/app/pawhaven/webapp/index.html` if it does not open automatically.

If the dependency install fails, run `npm cache verify` and retry `npm install --include=dev`. If it still fails, check that the BAS dev space has internet access to npmjs.org and share the complete terminal output. Do not manually copy a `node_modules` folder from another machine.
