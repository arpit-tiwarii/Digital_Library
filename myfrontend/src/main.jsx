import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import App from "./App.jsx"
import "bootstrap/dist/css/bootstrap.min.css"
import "./styles/main.css"

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_google_client_id_here"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
