import { NextFunction, Request, Response } from 'express'
import {
  body,
  validationResult,
  ContextRunner,
  ValidationChain
} from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// code này được lấy trên doc
// can be reused by many routes
const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })

    // xử lý errorObject
    for (const key in errorObject) {
      // lấy msg của từng cái lỗi
      const { msg } = errorObject[key]
      // nếu msg có dạng ErrorWithStatus và status !== 422 thì ném cho default error handler

      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        console.log(msg)

        return next(msg)
      }
      // lưu các lỗi 422 từ errorObject vào entityError
      entityError.errors[key] = msg
      console.log((entityError.errors[key] = msg))
    }

    //ở đây nó xử lý lỗi luôn chứ kh ném về error (default) handler tổng
    console.log('entityError', entityError)
    next(entityError)

    console.log('middlewareRes')
  }
}

export default validate
