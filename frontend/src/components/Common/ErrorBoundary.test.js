import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/Common/ErrorBoundary';

// Composant qui lance une erreur pour tester
const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    // Supprimer les erreurs de console pendant les tests
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('should render children when there is no error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should render error UI when child throws', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Oups ! Quelque chose s'est mal passé/i)).toBeInTheDocument();
        expect(screen.getByText(/Réessayer/i)).toBeInTheDocument();
    });

    it('should show custom fallback if provided', () => {
        const customFallback = <div>Custom Error Message</div>;

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom Error Message')).toBeInTheDocument();
    });
});
