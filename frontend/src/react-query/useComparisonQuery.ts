import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import axios from "axios";

/**
 * ✅ Fetch list of researcher names added to comparison.
 */
export const useComparisonResearchers = () => {
  const queryClient = useQueryClient();

  // Step 1: Fetch names from backend comparison list
  const {
    data: comparisonList = [],
    isLoading: isLoadingList,
    refetch,
  } = useQuery<string[]>({
    queryKey: ["comparisonResearchers"],
    queryFn: async () => {
      const { data } = await axios.get("http://134.155.86.170:8000/api/compare-researchers/");
      return data.comparison_list || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes caching
  });

  // Step 2: Fetch each researcher's full profile using names
  const researcherQueries = useQueries({
    queries: comparisonList.map((name) => ({
      queryKey: ["researcherProfile", name],
      queryFn: async () => {
        const response = await axios.get(
          `http://134.155.86.170:8000/api/researcher-profile/?author_name=${name}`
        );
        return response.data;
      },
      enabled: !!name, // Only if name is non-empty
      staleTime: 1000 * 60 * 5,
    })),
  });

  // Step 3: Map results for easier consumption
  const researchers = researcherQueries.map(({ data, isLoading, isError }, index) => ({
    name: comparisonList[index], // Include name for UI
    data,
    isLoading,
    isError,
  }));

  return { researchers, comparisonList, isLoading: isLoadingList, refetch };
};

/**
 * ✅ Add researcher to comparison list (by name) with optimistic UI update
 */

export const useAddResearcher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      await axios.post("http://134.155.86.170:8000/api/compare-researchers/", { name });
    },
    onSuccess: (_, name) => {
      queryClient.setQueryData(["comparisonResearchers"], (oldData: string[] | undefined) => {
        return oldData && !oldData.includes(name) ? [...oldData, name] : oldData || [name];
      });
    },
  });
};

/**
 * ✅ Remove researcher from comparison list (by name) with optimistic UI update
 */
export const useRemoveResearcher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      await axios.delete(`http://134.155.86.170:8000/api/compare-researchers/?name=${encodeURIComponent(name)}`);
    },
    onSuccess: (_, name) => {
      queryClient.setQueryData(["comparisonResearchers"], (oldData: string[] | undefined) => {
        return oldData ? oldData.filter((n) => n !== name) : [];
      });
    },
  });
};
