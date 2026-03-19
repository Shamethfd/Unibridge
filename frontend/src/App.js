import './App.css';
import { Routes, Route} from 'react-router-dom';
import HomePage from './Pages/HomePage';
import NoticePage from './Pages/NoticePage';
function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/notices' element={<NoticePage />} />
    </Routes>
  );
}

export default App;
