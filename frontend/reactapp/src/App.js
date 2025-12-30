import './App.css';
import Devices from './Devices';
import Device from './Device';
import UserLogin from './UserLogin';
import CLientAlarmFake from './ClientAlarmFake';
import DemoUserLogin from './DemoUserLogin';
import DemoSensorData from './DemoSensorData';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavigationBar from './components/NavigationBar';

function App() {
  const repoBase = '/RiverMonitoringSystem';
  const isGhPages = typeof window !== 'undefined' && window.location && window.location.pathname.startsWith(repoBase);
  const basename = process.env.PUBLIC_URL || (isGhPages ? repoBase : '/');
  return (
    <div className="App">
      <Router basename={basename}>
        <NavigationBar />
        <main>
          <Routes>
            <Route path="/" element={<UserLogin />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/device-sensors/:deviceId" element={<Device />} />
            <Route path="/clientalarmfake" element={<CLientAlarmFake />} />
            <Route path="/demo" element={<DemoUserLogin />} />
            <Route path="/demo/create_sensor_data" element={<DemoSensorData />} />
          </Routes>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </div>
  );
}

export default App;
