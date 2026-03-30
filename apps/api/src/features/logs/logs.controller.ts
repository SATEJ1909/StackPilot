import { processLog } from "./logs.service.js";


export const processLogHandler = async (req: any, res: any) => {
    const data = req.body;
    try {
        await processLog(data);
        res.status(200).json({ success : true , message: "Log processed successfully" });
    } catch (error) {
        console.log("error" , error);
        res.status(500).json({ success : false , message: "Failed to process log" });
    }
};