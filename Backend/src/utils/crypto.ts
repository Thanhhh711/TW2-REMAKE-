import { createHash } from 'crypto'
import { config } from 'dotenv'

config()

// hàm keys mã
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
  // password + sercet key
  return sha256(password + process.env.PASSWORD_SECRET)
}
