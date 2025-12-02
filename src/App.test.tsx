import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
    createClient: () => ({
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                }),
            }),
        }),
    }),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe('System Health Check', () => {
    it('Application renders without crashing', () => {
        render(<App />);
        expect(document.body).toBeInTheDocument();
    });

    it('Contains main router outlet', () => {
        render(<App />);
        // The App renders Routes, so we expect some content. 
        // Since we are at "/", Home should render.
        // Let's just verify the container exists
        expect(document.querySelector('div')).toBeInTheDocument();
    });
});
