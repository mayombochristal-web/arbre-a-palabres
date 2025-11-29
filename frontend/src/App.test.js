import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

const queryClient = new QueryClient();

test('renders app without crashing', () => {
    render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <MemoryRouter>
                    <App />
                </MemoryRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
    expect(true).toBe(true);
});
