import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { ogTagsMiddleware } from "./middlewares/ogTags";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bot-detection OG middleware — intercepts social crawler requests to SPA routes
// and returns pre-rendered OG meta HTML. Only applies to non-API routes.
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next()
  return ogTagsMiddleware(req, res, next)
})

app.use("/api", router);

app.get("/download/tmh-platform.html", (_req, res) => {
  res.download(
    path.resolve("/home/runner/workspace/tmh-platform-standalone.html"),
    "tmh-platform.html"
  );
});

export default app;
