import { useQuery } from "@tanstack/react-query";
import { getPools } from "@/utils/graphql";

export type PoolFilter = "all" | "static" | "dynamic";

export const usePools = (filter: PoolFilter = "all") => {
  const types = filter === "static" ? ["v3"] : filter === "dynamic" ? ["v4"] : ["v3", "v4"];
  
  return useQuery({
    queryKey: ["pools", filter],
    queryFn: () => getPools(types),
  });
};
