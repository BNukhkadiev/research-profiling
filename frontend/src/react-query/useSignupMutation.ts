import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface SignupResponse {
  message: string;
}

const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await axios.post<SignupResponse>(
    "http://127.0.0.1:8000/api/signup/", // Adjust the API endpoint if needed
    {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
    }
  );
  return response.data;
};

export const useSignupMutation = () =>
  useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: signup,
  });