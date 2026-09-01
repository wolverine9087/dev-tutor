import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const API_URL = import.meta.env.VITE_API_URL;
const AuthContext = createContext(null);

async function authRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message ||"Authentication request failed");
    }

    return data;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const data = await authRequest("/auth/me");

                console.log("AUTH /ME FULL RESPONSE:",data);
                console.log("AUTH /ME USER:",data.user);

                // Make sure all expected fields are preserved
                const currentUser = data.user
                    ? {
                          id: data.user.id,
                          name: data.user.name,
                          email: data.user.email,
                      }
                    : null;

                console.log("AUTH CONTEXT USER:",currentUser);

                setUser(currentUser);
            } catch (error) {
                console.error("GET CURRENT USER ERROR:",error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getCurrentUser();
    }, []);

    const login = async (credentials) => {
        const data = await authRequest(
            "/auth/login",
            {
                method: "POST",
                body: JSON.stringify(credentials),
            }
        );

        console.log("LOGIN RESPONSE:",data);

        const loggedInUser = data.user
            ? {
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
              }
            : null;

        setUser(loggedInUser);

        return loggedInUser;
    };

    const register = async (details) => {
        const data = await authRequest(
            "/auth/register",
            {
                method: "POST",
                body: JSON.stringify(details),
            }
        );

        console.log("REGISTER RESPONSE:",data);

        const registeredUser = data.user
            ? {
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
              }
            : null;

        setUser(registeredUser);

        return registeredUser;
    };

    const logout = async () => {
        try {
            await authRequest("/auth/logout", {
                method: "POST",
            });
        } finally {
            setUser(null);
        }
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            register,
            logout,
        }),
        [user, loading]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
      throw new Error("useAuth must be used inside an AuthProvider");
    }

    return context;
}

export default AuthContext;

