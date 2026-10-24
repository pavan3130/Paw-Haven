# BAS setup quick steps

1. Open the project folder in a BAS dev space with Node.js support.
2. In a terminal at the project root, verify Node.js 22+ with `node -v` and `npm -v`.
3. Install and build:
   ```bash
   npm install
   npm run build
   ```
4. Start the app:
   ```bash
   npm run watch:ui
   ```
5. Open the BAS preview at `/app/pawhaven/webapp/index.html` if it does not open automatically.

If startup fails, share the complete terminal output before changing dependencies.
