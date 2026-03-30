import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './Pages/Hpage';
import YearPage from './Pages/YearPage';
import SemesterPage from './Pages/SemesterPage';
import ModulePage from './Pages/ModulePage';
import RequestFormPage from './Pages/RequestFormPage';
import CodeIgniterDashboard from './Pages/CodeIgniterDashboard';
import TutorManagement from './Pages/TutorManagement';
import MyCoursePanel from './Components/MyCoursePanel';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/years/:facultyId/:facultyName" element={<YearPage />} />
        <Route path="/semesters/:yearId/:yearName" element={<SemesterPage />} />
        <Route path="/modules/:semesterId/:semesterName" element={<ModulePage />} />
        <Route path="/request/:moduleId/:moduleName" element={<RequestFormPage />} />
        <Route path="/codeigniter-dashboard" element={<CodeIgniterDashboard />} />
        <Route path="/tutor-management" element={<TutorManagement />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
      <MyCoursePanel />
    </>
  );
}

export default App;
