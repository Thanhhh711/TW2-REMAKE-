import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'

import {
  accessTokenValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const searchRouter = Router()

searchRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(searchController)
)

export default searchRouter
