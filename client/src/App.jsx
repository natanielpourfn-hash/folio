import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Convert from './pages/Convert'
import Pricing from './pages/Pricing'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastProvider } from './components/ui/Toast'

function AppInner() {
  const location = useLocation()
  const isConvertPage = location.pathname.startsWith('/convert')

  return (
    <div className="min-h-screen bg-bg font-body text-primary">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/convert/:tool" element={<Convert />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </AnimatePresence>
      {!isConvertPage && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}
