import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateJobPayload = {
  id: string;
  data: {
    company?: string;
    position?: string;
    positionType?: string;
    location?: string;
    link?: string;
    status?: string;
  };
};

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateJobPayload) => {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update job");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
        exact: false,
      });
    },
  });
}
