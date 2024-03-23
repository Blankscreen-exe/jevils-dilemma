import { useState } from 'react'
import './index.css';
import './App.css'
import DillemaBox from './components/DillemaBox'
import GameInit from './components/gameInit'

function App() {
  const [currentView, setCurrentView] = useState('gameInit');

  const handleCurrentView = (newView) => {
    setCurrentView(newView);
  };

  return (
    <div className='min-h-screen bg-gray-700'>
      {currentView === 'gameInit' && <GameInit handleCurrentView={handleCurrentView} />}
      {currentView === 'dillemaBox' && <DillemaBox />}
    </div>
  )
}

export default App;