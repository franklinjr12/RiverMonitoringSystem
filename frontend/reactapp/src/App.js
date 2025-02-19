import './App.css';
import Devices from './Devices';
import Device from './Device';
import UserLogin from './UserLogin';
import CLientAlarmFake from './ClientAlarmFake';
import DemoUserLogin from './DemoUserLogin';
import DemoSensorData from './DemoSensorData';
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
            <Route path="/demo" element={<DemoUserLogin />} />
            <Route path="/demo/create_sensor_data" element={<DemoSensorData />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;
