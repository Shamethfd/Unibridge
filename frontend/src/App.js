import './App.css';
import { Routes, Route} from 'react-router-dom';
import HomePage from './Pages/HomePage';
import NoticePage from './Pages/NoticePage';
import CreateNotice from './Components/NoticeManagement/CreateNotice';

function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/notices' element={<NoticePage />} />
      <Route path='/create-notice' element={<CreateNotice />} />
    </Routes>
  );
}

export default App;
