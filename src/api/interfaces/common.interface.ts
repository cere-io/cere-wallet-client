export interface ApiResponse<T> {
  code: 'SUCCESS' | 'ERROR';
  data: T;
}
