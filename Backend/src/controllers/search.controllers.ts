import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { SearchQuery } from '~/models/requests/Search.request'
import searchServices from '~/services/search.services'

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response
) => {
  const limit = Number(req.params.limit)
  const page = Number(req.params.page)
  const content = req.query.content as string
  const result = await searchServices.search({ content, limit, page })
  res.json({ message: 'Search success', result })
}
