import { Queue } from "bullmq";
import { bullQueueRedisConnection } from "./ioredis.js";

const QUEUE_ADD_TIMEOUT_MS = 2_500;

export const logQueue = bullQueueRedisConnection
  ? new Queue("log-ingestion", {
      connection: bullQueueRedisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    })
  : null;

export const addLogJob = async (data: unknown) => {
  if (!logQueue) {
    return false;
  }

  try {
    await Promise.race([
      logQueue.add("processLog", data),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timed out queueing log job")), QUEUE_ADD_TIMEOUT_MS);
      }),
    ]);

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown queue error";
    console.error(`[Queue] Failed to add log job: ${message}`);
    return false;
  }
};

if (logQueue) {
  logQueue.on("error", (error) => {
    console.error(`[Queue] ${error.name}: ${error.message}`);
  });
}
