import './App.css';
import { Navbar } from './components/Navbar';
import { AdsList } from './pages/AdsList';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { FileUpload } from './pages/FileUpload';
import { EditAds } from './pages/EditAds';

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
      </Routes>
    </div>
  );
}

export default App;
