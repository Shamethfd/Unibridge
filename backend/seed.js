// Seed script - run with: node seed.js
// Make sure the backend server's MongoDB is connected first

import mongoose from "mongoose";
import dotenv from "dotenv";
import Faculty from "./models/Faculty.js";
import Year from "./models/Year.js";
import Semester from "./models/Semester.js";
import Module from "./models/Module.js";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODBURL, { dbName: "moduleRequestDB" });
  console.log("Connected to MongoDB...");

  // Clear existing
  await Faculty.deleteMany({});
  await Year.deleteMany({});
  await Semester.deleteMany({});
  await Module.deleteMany({});

  console.log("Cleared old data...");

  // Faculties
  const faculties = await Faculty.insertMany([
    { name: "Computing", icon: "💻" },
    { name: "Engineering", icon: "⚙️" },
    { name: "Business", icon: "📈" },
    { name: "Architecture", icon: "🏗️" },
  ]);
  console.log(`Created ${faculties.length} faculties`);

  // Years for each faculty
  const years = [];
  for (const fac of faculties) {
    for (let i = 1; i <= 4; i++) {
      years.push({ name: `Year ${i}`, facultyId: fac._id });
    }
  }
  const createdYears = await Year.insertMany(years);
  console.log(`Created ${createdYears.length} years`);

  // Semesters (Semester 1 & 2 for each year)
  const semesters = [];
  for (const year of createdYears) {
    semesters.push({ name: "Semester 1", yearId: year._id });
    semesters.push({ name: "Semester 2", yearId: year._id });
  }
  const createdSemesters = await Semester.insertMany(semesters);
  console.log(`Created ${createdSemesters.length} semesters`);

  // Modules for Computing Year 1 Semester 1 as demo
  const computingYear1 = createdYears.find(
    (y) => y.name === "Year 1" && y.facultyId.toString() === faculties[0]._id.toString()
  );
  const sem1 = createdSemesters.find(
    (s) => s.name === "Semester 1" && s.yearId.toString() === computingYear1._id.toString()
  );
  const sem2 = createdSemesters.find(
    (s) => s.name === "Semester 2" && s.yearId.toString() === computingYear1._id.toString()
  );

  await Module.insertMany([
    { name: "Network Management", semesterId: sem1._id, description: "Computer networking fundamentals" },
    { name: "Database Systems", semesterId: sem1._id, description: "Relational databases and SQL" },
    { name: "Software Engineering", semesterId: sem1._id, description: "SDLC and software design patterns" },
    { name: "Discrete Mathematics", semesterId: sem2._id, description: "Logic, sets, and graph theory" },
    { name: "Web Development", semesterId: sem2._id, description: "HTML, CSS, JavaScript, React" },
    { name: "Operating Systems", semesterId: sem2._id, description: "Process management and memory" },
  ]);

  console.log("✅ Seed complete!");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
