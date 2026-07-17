import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import './App.css';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import AdminPanel from './pages/Admin/AdminPanel/AdminPanel';
import AdminLayout from './layouts/Admin/AdminLayout';
import AcademicMonitoring from './pages/Admin/AcademicMonitoring/AcademicMonitoring';
import Administration from './pages/Admin/Administration/Administration';
import SchoolManagement from './pages/Admin/SchoolManagement/SchoolManagement';
import EvaluationPlan from './pages/Admin/EvaluationPlan/EvaluationPlan';
import Grades from './pages/Admin/Grades/Grades';
import Formats from './pages/Admin/Formats/Formats';
import AppLayout from './layouts/App/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAxiosInterceptor } from './services/interceptor';

function App() {
  
  useAxiosInterceptor();

  return (

    <>

      <Toaster />

      <TooltipProvider>

      <BrowserRouter>

        <Routes>

          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={
            <ProtectedRoute><AdminLayout /></ProtectedRoute>
          }>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/control-estudio" element={<AcademicMonitoring />} />
            <Route path="/admin/gestion-escolar" element={<SchoolManagement />} />
            <Route path="/admin/administracion" element={<Administration />} />
            <Route path="/admin/plan-evaluacion" element={<EvaluationPlan />} />
            <Route path="/admin/notas" element={<Grades />} />
            <Route path="/admin/formatos" element={<Formats />} />
          </Route>


        </Routes>

      </BrowserRouter>

      </TooltipProvider>

    </>

  );

}

export default App;
