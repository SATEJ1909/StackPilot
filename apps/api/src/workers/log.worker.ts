import { Worker } from "bullmq";
import { redisConnection } from "../lib/ioredis.js";
import { processLog } from "../features/logs/logs.service.js";

// The worker processes logs in the background one by one.
export const logWorker = new Worker(
  "log-ingestion",
  async (job) => {
    try {
      // Process the log as it was doing synchronously before
      await processLog(job.data);
      console.log(`[Worker] Processed log for project: ${job.data.projectKey}`);
    } catch (err: any) {
      console.error(`[Worker] Error processing log:`, err.message);
      throw err; // Allow BullMQ to retry or mark as failed
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 logs concurrently
  }
);

logWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});
