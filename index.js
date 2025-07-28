import express from 'express';
import userRouter from './routes/user.js'
import courseRouter from './routes/course.js';
import adminRouter from './routes/admin.js';
import connectDB from './db.js';
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);


const startServer = async () => {
    await  connectDB();
app.listen(PORT, () => {
    console.log("express started");
});
};

startServer();