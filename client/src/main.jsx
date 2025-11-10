import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './Home.jsx'
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Analytics />
    <Home />
  </StrictMode>,
)
