import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import BrowserInterface from './components/BrowserInterface';
import { AIProvider } from './contexts/AIContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { BrowserProvider } from './contexts/BrowserContext';

function App() {
  console.log('App component rendering...');
  
  return (
    <Router>
      <AIProvider>
        <WorkflowProvider>
          <BrowserProvider>
            <div className="App h-screen w-screen overflow-hidden bg-dark-900">
              <div style={{color: 'white', padding: '20px'}}>
                <h1>Emergent AI Browser - Debug Mode</h1>
                <p>If you can see this, React is working!</p>
              </div>
              <BrowserInterface />
            </div>
          </BrowserProvider>
        </WorkflowProvider>
      </AIProvider>
    </Router>
  );
}

export default App;