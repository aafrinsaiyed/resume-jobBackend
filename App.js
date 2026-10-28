import 'dotenv/config';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
import express from 'express';
import cors from 'cors';
import connectDb from './config/db.js';
import userRouter from './route/userRoute.js';
import jobRouter from './route/jobRoute.js';
import applicationRouter from './route/applicationRoute.js';
import resumeRouter from './route/resumeRoute.js';
import recruiterRouter from './route/recruiterRoute.js';
import uploadRouter from './route/uploadRoute.js';
import chatRouter from "./route/chatRouter.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(uploadRouter);
app.use(userRouter);
app.use(jobRouter);
app.use(applicationRouter);
app.use(resumeRouter);
app.use(recruiterRouter);
app.use("/api/chat", chatRouter);

app.get('/', (req, res) => {
  res.send('Backend running successfully');
});

app.use((req, res) => {
  res.status(404).json({ status: 0, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ status: 0, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ App is running on port http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    console.error("❌ Server not started because MongoDB connection failed.");
  });