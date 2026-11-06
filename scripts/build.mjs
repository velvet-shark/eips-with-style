// `npm run build`. On Vercel production builds with CONVEX_DEPLOY_KEY set, deploys the Convex
// functions first (so the database code always matches the deployed site), then builds Next.js.
// Preview and local builds only run `next build`, so they never touch the production deployment.
import { execSync } from "node:child_process";

const deployConvex = process.env.VERCEL_ENV === "production" && Boolean(process.env.CONVEX_DEPLOY_KEY);
const command = deployConvex ? "npx convex deploy --cmd 'next build'" : "next build";

console.log(`> ${command}`);
execSync(command, { stdio: "inherit" });
