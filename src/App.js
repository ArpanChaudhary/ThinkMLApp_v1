import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ThinkBot from './components/ThinkBot';

function App() {
  return (
    <Router>
      <div className="App">
        <ThinkBot />
      </div>
    </Router>
  );
}

export default App; 