import './App.css';
import { Navbar } from './components/Navbar';
import { PrivateRoute } from './components/PrivateRoute';
import { AdsList } from './pages/AdsList';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { FileUpload } from './pages/FileUpload';
import { EditAds } from './pages/EditAds';
import {AdminDashboard} from './components/AdminDashboard';
import {UnauthorizedPage} from './components/UnauthorizedPage';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="w-screen min-h-screen overflow-y-hidden flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<AdsList />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/FileUpload" element={<FileUpload />} />
        <Route path="/AdsList" element={<AdsList />} />
        <Route path="/EditAds/:fileId" element={<EditAds />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/unauthorized/:fileId?" element={<UnauthorizedPage />} />
        
      </Routes>
    </div>
  );
}

export default App;
