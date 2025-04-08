import { Pagination } from './Tweet.request'

export interface SearchQuery extends Pagination {
  content: string
}
