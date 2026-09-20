import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { RegistrationPage } from './features/registration/RegistrationPage'
import Layout from './components/layout/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apply" element={<RegistrationPage />} />
        <Route path="/apply/success" element={<RegistrationPage />} />
      </Routes>
    </Layout>
  )
}

export default App