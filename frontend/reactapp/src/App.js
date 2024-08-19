import logo from './logo.svg';
import './App.css';
import SensorDataChart from './SensorDataChart';
import Devices from './Devices';
import DeviceSensors from './DeviceSensors';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <main>
        <Router>
          <Routes>
            <Route path="/" element={<Devices />} />
            <Route path="/device-sensors/:deviceId" element={<DeviceSensors />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;
