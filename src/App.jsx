
import DillemaBox from './components/DillemaBox'
import MenuMain from "./components/gameInit/MenuMain"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className='min-h-screen bg-gray-700'>
        <Routes>
          <Route path="/" element={<MenuMain />} />
          <Route path="/dilemma-box" element={<DillemaBox />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;

