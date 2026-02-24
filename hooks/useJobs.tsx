"use client";

import { useQuery } from "@tanstack/react-query";

export function useJobs(
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  order: "asc" | "desc"
) {
  return useQuery({
    queryKey: ["jobs", page, limit, search, sortBy, order],
    queryFn: async () => {
      const res = await fetch(
        `/api/jobs?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&order=${order}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch jobs");
      }

      return res.json();
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
}
