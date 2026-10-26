import React from 'react'
import ReactDOM from 'react-dom/client'
import RegistrationPortal from './components/RegistrationPortal'
import RegistrationClosed from './components/RegistrationClosed'
import { EVENT_CONFIG } from './config'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {EVENT_CONFIG.forceCloseRegistration ? <RegistrationClosed /> : <RegistrationPortal />}
    </React.StrictMode>,
)
