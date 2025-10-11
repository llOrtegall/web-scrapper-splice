import { registerNewUser, loginUser, UserByToken, logoutUser } from '../controllers/user'
import { authenticateToken } from '../middlewares/authToken'
import { Router } from 'express'

const routerUsers = Router()

routerUsers.post('/register', authenticateToken, registerNewUser)
routerUsers.get('/profile', UserByToken)
routerUsers.post('/login', loginUser)
routerUsers.post('/logout', logoutUser)

export { routerUsers }
