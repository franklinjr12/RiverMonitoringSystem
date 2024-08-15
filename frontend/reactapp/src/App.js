import logo from './logo.svg';
import './App.css';
import SensorDataChart from './SensorDataChart';

function App() {
  return (
    <div className="App">
      <main>
        <SensorDataChart dataSource="level" />
        <SensorDataChart dataSource="temperature" />
      </main>
    </div>
  );
}

export default App;
