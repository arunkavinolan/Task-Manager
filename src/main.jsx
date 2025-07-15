import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TaskManagementDashboard from './TaskDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TaskManagementDashboard/>
    <App />
  </StrictMode>,
)
