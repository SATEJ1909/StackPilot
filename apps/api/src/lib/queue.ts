import { Queue } from "bullmq";
import { redisConnection } from "./ioredis.js";

export const logQueue = new Queue("log-ingestion", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
