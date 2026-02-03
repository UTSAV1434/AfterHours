import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    username: string;
    displayName: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, displayName: string) => void;
    logout: () => void;
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('night_thoughts_user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (username: string, displayName: string) => {
        const newUser = { username, displayName };
        setUser(newUser);
        localStorage.setItem('night_thoughts_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('night_thoughts_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
