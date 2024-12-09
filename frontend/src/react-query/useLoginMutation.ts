import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Define the request and response types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// Define the mutation function
const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    "http://127.0.0.1:8000/api/login/",
    data
  );
  return response.data;
};

// Export a typed hook for login
export const useLoginMutation = () =>
  useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
  });
