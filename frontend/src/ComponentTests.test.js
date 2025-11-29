import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Common/Header';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';

test('renders Header', () => {
    render(
        <AuthProvider>
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        </AuthProvider>
    );
});

test('renders Navbar', () => {
    render(
        <AuthProvider>
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        </AuthProvider>
    );
});

test('renders Footer', () => {
    render(
        <AuthProvider>
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        </AuthProvider>
    );
});
