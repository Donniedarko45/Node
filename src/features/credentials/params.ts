import { Pagination } from "@/config/constant";
import { parseAsInteger, parseAsString } from "nuqs/server";

export const credentialsSearchParams = {
  page: parseAsInteger.withDefault(Pagination.DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(Pagination.DEFAULT_PAGE_SIZE),
  search: parseAsString.withDefault(""),
};
