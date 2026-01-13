import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval("compute popular proposals", { hours: 1 }, api.popular.computePopularProposals, {});

export default crons;
