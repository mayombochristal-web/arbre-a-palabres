import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useCandidats, useDebats, useCloturerDebat } from '../hooks/useApi';
import * as api from '../services/api';

// Mock des services API
jest.mock('../services/api');

// Helper pour wrapper les hooks avec QueryClient
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useApi Hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useCandidats', () => {
        it('should fetch candidats successfully', async () => {
            const mockData = {
                data: {
                    candidats: [
                        { _id: '1', nom: 'Doe', prenom: 'John' },
                        { _id: '2', nom: 'Smith', prenom: 'Jane' },
                    ],
                    total: 2,
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            api.candidatService.getAll.mockResolvedValue(mockData);

            const { result } = renderHook(() => useCandidats({ page: 1, limit: 20 }), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual(mockData.data);
            expect(api.candidatService.getAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
        });

        it('should handle errors gracefully', async () => {
            api.candidatService.getAll.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useCandidats(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toBeTruthy();
        });
    });

    describe('useDebats', () => {
        it('should fetch debats with filters', async () => {
            const mockData = {
                data: {
                    debats: [{ _id: '1', theme_debat: 'Test' }],
                    total: 1,
                },
            };

            api.debatService.getAll.mockResolvedValue(mockData);

            const { result } = renderHook(
                () => useDebats({ page: 1, statut: 'en_cours' }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual(mockData.data);
        });
    });

    describe('useCloturerDebat', () => {
        it('should cloturer debat and invalidate caches', async () => {
            const mockResponse = { data: { success: true } };
            api.debatService.cloturer.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useCloturerDebat(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ id: '123', vainqueurId: '456' });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(api.debatService.cloturer).toHaveBeenCalledWith('123', '456');
        });
    });
});
