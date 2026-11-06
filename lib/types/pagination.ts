export interface PaginationParams {
  page: number;
  size: number;
}

export interface Pagination<T> extends PaginationParams {
  data: T[];
  total: number;
}
