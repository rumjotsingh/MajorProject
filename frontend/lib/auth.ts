import api from "./api";

export interface User {
  userId: string;
  name: string;
  email: string;
  role: "Learner" | "Employer" | "Issuer" | "Admin";
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "Learner" | "Employer" | "Issuer";
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // Step 1: Login to get token
      const loginResponse = await api.post("/auth/login", credentials);
      console.log("Login response:", loginResponse.data);
      
      const { token, refreshToken } = loginResponse.data;
      
      if (!token) {
        throw new Error("No token received from server");
      }
      
      // Step 2: Store token temporarily
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      
      // Step 3: Fetch user profile with the token
      const userResponse = await api.get("/auth/me");
      console.log("User profile:", userResponse.data);
      
      const user = userResponse.data;
      
      // Step 4: Store user data
      localStorage.setItem("user", JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      // Clean up on error
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<{ message: string }> {
    try {
      const response = await api.post("/auth/register", data);
      console.log("Register response:", response.data);
      
      return { message: "Registration successful" };
    } catch (error: any) {
      console.error("Registration error:", error.response?.data || error.message);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },
};
