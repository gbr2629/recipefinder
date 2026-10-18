import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const load = () => {
  try {
    return JSON.parse(localStorage.getItem("rf_user"));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(load);

  // call with the object the API returns on login / register / profile update
  const saveUser = (data) => {
    localStorage.setItem("rf_user", JSON.stringify(data));
    setUser(data);
  };
  const logout = () => {
    localStorage.removeItem("rf_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, saveUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
