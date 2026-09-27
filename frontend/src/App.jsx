import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import ReleaseList from './pages/ReleaseList';
import CreateRelease from './pages/CreateRelease';
import ReleaseDetails from './pages/ReleaseDetails';

const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_URI || 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<ReleaseList />} />
            <Route path="/create" element={<CreateRelease />} />
            <Route path="/release/:id" element={<ReleaseDetails />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
