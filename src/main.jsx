import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Provider } from "react-redux"
import './tailwind-compiled.css'
import store, { persistor } from "./store.jsx"
import { PersistGate } from "redux-persist/integration/react"

// Router
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>,
    </BrowserRouter>
  </React.StrictMode>
)
