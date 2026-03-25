import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

async function main(){
    await mongoose.connect(process.env.MONGO_URI as string)
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

main();