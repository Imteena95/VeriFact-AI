import { useQueryClient } from "@tanstack/react-query";
import { 
  useListFacts,
  useCreateFact as useOrvalCreateFact,
  useDeleteFact as useOrvalDeleteFact,
  getListFactsQueryKey,
  type ListFactsParams
} from "@workspace/api-client-react";

export function useFacts(params?: ListFactsParams) {
  return useListFacts(params);
}

export function useCreateFact() {
  const queryClient = useQueryClient();
  return useOrvalCreateFact({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFactsQueryKey() });
      }
    }
  });
}

export function useDeleteFact() {
  const queryClient = useQueryClient();
  return useOrvalDeleteFact({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFactsQueryKey() });
      }
    }
  });
}
