import React, { useState, useEffect, useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { User } from '../types';
import { createRoutes } from './routes';
import { subscribeToAuthChanges } from '../services/authService';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Create routes with current user context - memoized to prevent router recreation
    // This must be called BEFORE the conditional return to satisfy Rules of Hooks
    const router = useMemo(
        () => createBrowserRouter(createRoutes(currentUser, setCurrentUser)),
        [currentUser]
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <RouterProvider router={router} />;
};

export default App;
