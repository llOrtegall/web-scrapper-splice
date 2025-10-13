import { registerNewUser, loginUser, UserByToken, logoutUser, getAllUsers, updateUserNameOrState, deleteUser } from '../controllers/user.js'
import { authenticateToken } from '../middlewares/authToken.js'
import { Router } from 'express'

const routerUsers = Router()

routerUsers.post('/update', authenticateToken, updateUserNameOrState)
routerUsers.post('/delete', authenticateToken, deleteUser)
routerUsers.post('/register', authenticateToken, registerNewUser)
routerUsers.get('/users', authenticateToken, getAllUsers)
routerUsers.get('/profile', UserByToken)
routerUsers.post('/login', loginUser)
routerUsers.post('/logout', logoutUser)

export { routerUsers }
