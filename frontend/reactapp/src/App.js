import logo from './logo.svg';
import './App.css';
import SensorDataChart from './SensorDataChart';
import Devices from './Devices';
import Device from './Device';
import UserLogin from './UserLogin';
import CLientAlarmFake from './ClientAlarmFake';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <main>
        <Router>
          <Routes>
            <Route path="/" element={<UserLogin />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/device-sensors/:deviceId" element={<Device />} />
            <Route path="/clientalarmfake" element={<CLientAlarmFake />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;
