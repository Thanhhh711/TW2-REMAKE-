import { SearchQuery } from './../models/requests/Search.request'
import databaseService from './database.services'

class SearchServices {
  //ta k co query: SearchQuery vì {content:string, limit:string, page:string}
  //hàm này sẽ giúp ta tìm nè
  async search(query: { content: string; limit: number; page: number }) {
    const { content, limit, page } = query
    const result = await databaseService.tweets
      .find({ $text: { $search: content } })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    return result
  }
}

const searchServices = new SearchServices()
export default searchServices
