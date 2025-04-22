import { useQuery } from "@tanstack/react-query";
import { getPools } from "@/utils/graphql";

export const usePools = () => {
  return useQuery({
    queryKey: ["pools"],
    queryFn: getPools,
  });
};
