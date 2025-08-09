import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Home } from './routes/Home';
import { ArticleDetail } from './routes/ArticleDetail';
import { NotFound } from './routes/NotFound';
import { ArticlesList } from './routes/ArticlesList';
import { NarrativeDetail } from './routes/NarrativeDetail';
import { Analyze } from './routes/Analyze';
import { FetchArticles } from './routes/FetchArticles';
import './index.css';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        const msg = typeof error === 'object' && error && 'message' in error ? String((error as { message?: string }).message ?? '') : '';
        if (msg.includes('404')) return false;
        return failureCount < 2;
      }
    }
  }
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}> 
            <Route index element={<Home />} />
            <Route path="articles" element={<ArticlesList />} />
            <Route path="articles/:id" element={<ArticleDetail />} />
            <Route path="narratives/:id" element={<NarrativeDetail />} />
            <Route path="analyze" element={<Analyze />} />
            <Route path="fetch" element={<FetchArticles />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
