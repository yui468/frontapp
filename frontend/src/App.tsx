import React from 'react';
import './App.css';
import Pokemon from './Pokemon';
import Nikke from './Nikke';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Pokemon />
      <Nikke />
    </div>
  );
};

export default App;
