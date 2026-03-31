import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import AuthRouter from "./features/auth/auth.routes.js";
import ProjectRouter from "./features/project/project.routes.js";
import LogsRouter from "./features/logs/logs.routes.js";
import ErrorRouter from "./features/error-group/error.routes.js";



const app = express();


app.use(express.json());
app.use(cors());
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/project", ProjectRouter);
app.use("/api/v1/logs", LogsRouter);
app.use("/api/v1/error", ErrorRouter);

main()
const PORT = process.env.PORT || 5000;

async function main(){
    await mongoose.connect(process.env.MONGO_URI as string)
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

main();