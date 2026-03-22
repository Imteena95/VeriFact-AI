import { useQueryClient } from "@tanstack/react-query";
import { 
  useListPosts,
  useCheckPost as useOrvalCheckPost,
  useRunBatch as useOrvalRunBatch,
  getListPostsQueryKey,
  type ListPostsParams
} from "@workspace/api-client-react";
import { useInvalidatePipeline } from "./use-pipeline";

export function usePosts(params?: ListPostsParams) {
  return useListPosts(params, {
    query: {
      refetchInterval: 10000,
    }
  });
}

export function useCheckPost() {
  const queryClient = useQueryClient();
  const invalidatePipeline = useInvalidatePipeline();
  
  return useOrvalCheckPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        invalidatePipeline();
      }
    }
  });
}

export function useRunBatch() {
  const queryClient = useQueryClient();
  const invalidatePipeline = useInvalidatePipeline();
  
  return useOrvalRunBatch({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        invalidatePipeline();
      }
    }
  });
}
