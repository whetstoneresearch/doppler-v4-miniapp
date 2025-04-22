import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { config } from './lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AllPools from './pages/AllPools'
import CreatePool from './pages/CreatePool'
import PoolDetails from './pages/PoolDetails'
import { Navbar } from './components/ui/navbar'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-background cyber-grid">
            <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
              <Navbar />
              <main className="container mx-auto">
                <Routes>
                  <Route path="/" element={<AllPools />} />
                  <Route path="/create" element={<CreatePool />} />
                  <Route path="/pool/:address" element={<PoolDetails />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
