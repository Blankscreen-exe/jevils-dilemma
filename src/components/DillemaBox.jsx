import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'

// data
import dilemmas from '../data/dillemas.json'

function DillemaBox(props) {
    
    const [currentDilemma, setCurrentDilemma] = useState(null);
    const [shownDilemmas, setShownDilemmas] = useState(new Set());
    const [history, setHistory] = useState([]);
  
    useEffect(() => {
      const randomIndex = Math.floor(Math.random() * dilemmas.length);
      setCurrentDilemma(dilemmas[randomIndex]);
    }, []); // Run only once on component mount
  
    const handleNextDilemma = () => {
      const availableDilemmas = dilemmas.filter(
        (dilemma) => !shownDilemmas.has(dilemma.id)
      );
  
      if (availableDilemmas.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableDilemmas.length);
        const newDilemma = availableDilemmas[randomIndex];
        setCurrentDilemma(newDilemma);
        setShownDilemmas((prevShown) => new Set([...prevShown, newDilemma.id]));
        setHistory((prevHistory) => [...prevHistory, newDilemma]);
      } else {
        alert('No more dilemmas to show!');
      }
    };
  
    return (
      <div>
        {currentDilemma && (
          <>
            <p>{currentDilemma.dillema}</p>
            <button onClick={handleNextDilemma}>Next Dilemma</button>
            <h2>Encountered Dilemmas</h2>
            <ol>
              {history.slice().reverse().map((dilemma, index) => (
                <li key={dilemma.id}>{dilemma.dillema}</li>
              ))}
            </ol>
          </>
        )}
      </div>
    );
}

DillemaBox.propTypes = {}

export default DillemaBox
