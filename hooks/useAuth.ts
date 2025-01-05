import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  //   useEffect(() => {
  //     // Simulate authentication check (e.g., check token/session)
  //     const simulateAuthCheck = async () => {
  //       // Simulate a delay for loading
  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //       setIsAuthenticated(false); // Set to `true` when logged in
  //     };

  //     simulateAuthCheck();
  //   }, []);

  return { isAuthenticated };
}
