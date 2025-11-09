import morgan from 'morgan'
import { logger } from '../utils/logger.js'

// Stream pour Morgan
const stream = {
  write: (message) => logger.http(message.trim())
}

// Configuration Morgan
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
)

export default morganMiddleware