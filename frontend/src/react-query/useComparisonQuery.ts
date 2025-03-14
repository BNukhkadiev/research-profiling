import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import axios from "axios";

// ✅ Fetch comparison list (only PIDs)
export const useComparisonResearchers = () => {
  const queryClient = useQueryClient();

  const {
    data: comparisonList = [],
    isLoading: isLoadingList,
    refetch,
  } = useQuery({
    queryKey: ["comparisonResearchers"],
    queryFn: async () => {
      const { data } = await axios.get("http://127.0.0.1:8000/api/compare-researchers/");
      return data.comparison_list || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Use `useQueries` to fetch researcher profiles
  const researcherQueries = useQueries({
    queries: comparisonList.map((pid) => ({
      queryKey: ["researcherProfile", pid],
      queryFn: async () => {
        const response = await axios.get(`http://127.0.0.1:8000/api/researcher-profile/?pid=${encodeURIComponent(pid)}`);
        return response.data;
      },
      enabled: !!pid, // Ensures we only fetch when pid exists
      staleTime: 1000 * 60 * 5,
    })),
  });

  // ✅ Transform researcher data
  const researchers = researcherQueries.map(({ data, isLoading, isError }, index) => ({
    pid: comparisonList[index],
    data,
    isLoading,
    isError,
  }));

  return { researchers, comparisonList, isLoading: isLoadingList, refetch };
};

// ✅ Add researcher to comparison (Immediate UI Update)
export const useAddResearcher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pid: string) => {
      await axios.post("http://127.0.0.1:8000/api/compare-researchers/", { pid });
    },
    onSuccess: (_, pid) => {
      queryClient.setQueryData(["comparisonResearchers"], (oldData: string[] | undefined) => {
        return oldData ? [...oldData, pid] : [pid];
      });
    },
  });
};

// ✅ Remove researcher from comparison (Immediate UI Update)
export const useRemoveResearcher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pid: string) => {
      await axios.delete("http://127.0.0.1:8000/api/compare-researchers/", { data: { pid } });
    },
    onSuccess: (_, pid) => {
      queryClient.setQueryData(["comparisonResearchers"], (oldData: string[] | undefined) => {
        return oldData ? oldData.filter((id) => id !== pid) : [];
      });
    },
  });
};
