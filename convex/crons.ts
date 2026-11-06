import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// The ranking covers 30 days and clients cache it for 15 minutes, so a 6-hour refresh is not noticeable.
crons.interval("compute popular proposals", { hours: 6 }, internal.popular.computePopularProposals, {});

crons.daily("prune old proposal views", { hourUTC: 3, minuteUTC: 0 }, internal.views.pruneOldViews, {});

export default crons;
