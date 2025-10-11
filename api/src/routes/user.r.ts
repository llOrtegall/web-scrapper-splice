import { authenticateToken } from '../middlewares/authToken'
import { registerNewUser, loginUser, UserByToken } from '../controllers/user'
import { Router } from 'express'

const routerUsers = Router()

routerUsers.post('/register', authenticateToken, registerNewUser)
routerUsers.get('/profile', authenticateToken, UserByToken)
routerUsers.post('/login', loginUser)

export { routerUsers }
