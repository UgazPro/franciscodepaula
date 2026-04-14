import { BrowserRouter, Routes, Route } from 'react-router';
import './App.css';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import AdminPanel from './pages/Admin/AdminPanel/AdminPanel';
import AdminLayout from './layouts/Admin/AdminLayout';
import Students from './pages/Admin/Students/Students';
import AcademicMonitoring from './pages/Admin/AcademicMonitoring/AcademicMonitoring';
import Teachers from './pages/Admin/Teachers/Teachers';
import Administration from './pages/Admin/Administration/Administration';
import AppLayout from './layouts/App/AppLayout';

function App() {

  return (

    <>

      <BrowserRouter>

        <Routes>

          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/estudiantes" element={<Students />} />
            <Route path="/admin/control-estudio" element={<AcademicMonitoring />} />
            <Route path="/admin/profesores" element={<Teachers />} />
            <Route path="/admin/administracion" element={<Administration />} />
          </Route>


        </Routes>

      </BrowserRouter>

    </>

  );

}

export default App;
