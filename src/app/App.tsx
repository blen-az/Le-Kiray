import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import SplashScreen from '../components/common/SplashScreen';
import { routes } from './routes';

const router = createBrowserRouter(routes);

const App: React.FC = () => {
 const { loading } = useAuth();

 if (loading) {
 return <SplashScreen />;
 }

 return <RouterProvider router={router} />;
};

export default App;
