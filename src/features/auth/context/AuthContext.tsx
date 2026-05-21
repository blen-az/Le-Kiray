import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../../../types';
import { subscribeToAuthChanges, subscribeToUserDoc, logout as firebaseLogout, auth } from '../../../services/authService';

interface AuthContextType {
 currentUser: User | null;
 loading: boolean;
 logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
 const [currentUser, setCurrentUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 const queryClient = useQueryClient();

 useEffect(() => {
 let unsubscribeDoc: (() => void) | null = null;

 const unsubscribeAuth = subscribeToAuthChanges((user) => {
 if (user && auth.currentUser) {
 if (unsubscribeDoc) unsubscribeDoc();
 unsubscribeDoc = subscribeToUserDoc(auth.currentUser.uid, auth.currentUser, (updatedUser) => {
 setCurrentUser(updatedUser);
 setLoading(false);
 });
 } else {
 if (unsubscribeDoc) unsubscribeDoc();
 setCurrentUser(null);
 setLoading(false);
 }
 });

 return () => {
 unsubscribeAuth();
 if (unsubscribeDoc) unsubscribeDoc();
 };
 }, []);

 const logout = async () => {
 try {
 await firebaseLogout();
 queryClient.clear(); // Clear all react-query cache to prevent stale sessions
 setCurrentUser(null);
 } catch (error) {
 console.error('Logout failed:', error);
 throw error;
 }
 };

 const value = {
 currentUser,
 loading,
 logout
 };

 return (
 <AuthContext.Provider value={value}>
 {children}
 </AuthContext.Provider>
 );
};

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};
