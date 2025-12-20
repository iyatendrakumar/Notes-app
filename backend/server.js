import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";
const app = express()
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use('/user', userRoute);

app.listen(PORT, async()=>{
     await connectDB();
    console.log(`Server is listening at port ${PORT}`);
})