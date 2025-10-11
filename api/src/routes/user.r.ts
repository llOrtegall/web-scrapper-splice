import { registerNewUser, loginUser} from '../controllers/user'
import { Router } from 'express'

const routerUsers = Router()

routerUsers.post('/register', registerNewUser)
routerUsers.post('/login', loginUser)

export { routerUsers }
