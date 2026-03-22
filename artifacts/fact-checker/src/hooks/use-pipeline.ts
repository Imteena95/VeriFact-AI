import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetPipelineStats,
  getGetPipelineStatsQueryKey
} from "@workspace/api-client-react";

export function usePipelineStats() {
  return useGetPipelineStats({
    query: {
      refetchInterval: 5000, // Poll every 5s for live dashboard feel
    }
  });
}

export function useInvalidatePipeline() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: getGetPipelineStatsQueryKey() });
  };
}
