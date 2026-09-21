import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ApplyPage from './pages/ApplyPage'
import ApplicationSuccessPage from './pages/ApplicationSuccessPage'
import Layout from './components/layout/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/apply/success" element={<ApplicationSuccessPage />} />
      </Routes>
    </Layout>
  )
}

export default App