import { NextFunction, Request, RequestHandler, Response } from 'express'

// kiểu currying
export const wrapAsync =
  <P>(func: RequestHandler<P, any, any, any>) =>
  async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
