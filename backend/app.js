import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import facultyRoutes from "./routes/facultyRoutes.js";
import yearRoutes from "./routes/yearRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/faculties", facultyRoutes);
app.use("/api/years", yearRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/preferences", preferenceRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "Module & Study Request API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
