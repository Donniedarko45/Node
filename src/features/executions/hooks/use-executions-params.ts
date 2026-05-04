import { Pagination } from "@/config/constant";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const useExecutionsParams = () => {
  return useQueryStates({
    page: parseAsInteger.withDefault(Pagination.DEFAULT_PAGE),
    pageSize: parseAsInteger.withDefault(Pagination.DEFAULT_PAGE_SIZE),
    workflowId: parseAsString,
  });
};
