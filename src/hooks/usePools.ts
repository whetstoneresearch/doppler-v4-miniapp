import { useQuery } from "@tanstack/react-query";
import { getPools } from "@/utils/graphql";

export type PoolFilter = "all" | "static" | "dynamic" | "multicurve";

export const usePools = (filter: PoolFilter = "all") => {
  const types =
    filter === "static"
      ? ["v3"]
      : filter === "dynamic"
        ? ["v4"]
        : filter === "multicurve"
          ? ["multicurve"]
          : undefined;

  const query = useQuery({
    queryKey: ["pools", filter],
    queryFn: () => getPools(types),
  });

  console.log("usePools", { filter, types, data: query.data });

  return query;
};
