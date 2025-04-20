import './App.css';
import { Navbar } from './components/Navbar';
import { AdsList } from './pages/AdsList';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

function App() {
  return (
    <div className="w-screen min-h-screen overflow-y-hidden flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<AdsList />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App;
