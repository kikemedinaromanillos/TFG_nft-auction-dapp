import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Web3Provider } from './Web3Context';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
// import './styles/index.css';  ← ELIMINA esta línea si causa conflictos

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Web3Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Web3Provider>
  </StrictMode>
);