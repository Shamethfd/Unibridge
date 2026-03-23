const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*"
  })
);
app.use(express.json());

app.use("/api/tutor-applications", require("./routes/tutorApplicationRoutes"));
app.use("/api/sessions", require("./routes/studySessionRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));

app.get("/", (req, res) => res.send("UniBridge backend running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));