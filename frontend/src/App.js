import './App.css';
import { Navbar } from './components/Navbar';
import { AdsList } from './pages/AdsList';
function App() {
  return (
    <div className="w-screen min-h-screen overflow-y-hidden flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<AdsList />} />
      </Routes>
    </div>
  );
}

export default App;
