import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './Pages/HomePage';
import FacultyPage from './Pages/FacultyPage';
import YearPage from './Pages/YearPage';
import SemesterPage from './Pages/SemesterPage';
import ModulePage from './Pages/ModulePage';
import RequestFormPage from './Pages/RequestFormPage';
import AdminDashboard from './Pages/AdminDashboard';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/faculties" element={<FacultyPage />} />
        <Route path="/years/:facultyId/:facultyName" element={<YearPage />} />
        <Route path="/semesters/:yearId/:yearName" element={<SemesterPage />} />
        <Route path="/modules/:semesterId/:semesterName" element={<ModulePage />} />
        <Route path="/request/:moduleId/:moduleName" element={<RequestFormPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
    </>
  );
}

export default App;
