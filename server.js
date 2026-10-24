import cds from "@sap/cds";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

cds.on("bootstrap", (app) => {
  app.use("/app", express.static(path.join(projectRoot, "app"), {
    fallthrough: true,
    etag: true,
    maxAge: "1h"
  }));
});

export default cds.server;
