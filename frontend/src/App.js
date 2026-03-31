import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import HomePage from './Pages/HomePage';
import StudentDashboard from './Pages/StudentDashboard';
import TutorApplicationPage from './Pages/TutorApplicationPage';
import NoticeBoardPage from './Pages/NoticeBoardPage';
import FeedbackPage from './Pages/FeedbackPage';
import TutorDashboard from './Pages/TutorDashboard';
import CreateSessionPage from './Pages/CreateSessionPage';
import TutorRatingPage from './Pages/TutorRatingPage';
import TutorMessagesPage from './Pages/TutorMessagesPage';
import CoordinatorDashboard from './Pages/CoordinatorDashboard';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Home */}
        <Route path='/' element={<HomePage />} />

        {/* Student Routes */}
        <Route path='/student' element={<StudentDashboard />} />
        <Route path='/student/apply' element={<TutorApplicationPage />} />
        <Route path='/student/noticeboard' element={<NoticeBoardPage />} />
        <Route path='/student/feedback' element={<FeedbackPage />} />

        {/* Tutor Routes */}
        <Route path='/tutor' element={<TutorDashboard />} />
        <Route path='/tutor/create-session' element={<CreateSessionPage />} />
        <Route path='/tutor/ratings' element={<TutorRatingPage />} />
        <Route path='/tutor/messages' element={<TutorMessagesPage />} />

        {/* Coordinator Routes */}
        <Route path='/coordinator' element={<CoordinatorDashboard />} />
      </Routes>
    </Layout>
  );
}

export default App;
