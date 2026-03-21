import './App.css';
import { Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import NoticePage from './Pages/NoticePage';
import CreateNotice from './Components/NoticeManagement/CreateNotice';
import NoticeDetail from './Components/NoticeManagement/NoticeDetail';
import UserNoticeView from './Components/NoticeManagement/UserNoticeView';
import NoticeRequest from './Components/NoticeManagement/NoticeRequest';
import NoticeRequestList from './Components/NoticeManagement/NoticeRequestList';

function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/notices' element={<NoticePage />} />
      <Route path='/user-notices' element={<UserNoticeView />} />
      <Route path='/notices/:id' element={<NoticeDetail />} />
      <Route path='/create-notice' element={<CreateNotice />} />
      <Route path='/notice-request' element={<NoticeRequest />} />
      <Route path='/notice-requests' element={<NoticeRequestList />} />
    </Routes>
  );
}

export default App;