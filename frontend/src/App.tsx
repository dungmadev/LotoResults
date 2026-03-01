import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from './hooks/useTheme';
import Navbar from './components/Navbar';
import SSEProvider from './components/SSEProvider';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import HistoryPage from './pages/HistoryPage';
import ComparePage from './pages/ComparePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SSEProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/results" element={<SearchPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </SSEProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

