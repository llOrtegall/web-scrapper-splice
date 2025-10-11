import { ENV, JWT_SECRECT, ROUNDS_SALT } from '../schemas/env'
import { Request, Response } from "express";
import { User } from "../models/user.m";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerNewUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return
  }

  const userReq = req.user;

  if (!userReq) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  if (userReq.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized: You are not authorized to perform this action' });
    return;
  }

  await User.sync();

  const hashedPassword = await bcrypt.hash(password, ROUNDS_SALT);

  await User.create({ username, password: hashedPassword })
    .then((user) => {

      const userDTO = {
        id: user.id,
        username: user.username,
        role: user.role,
      }

      res.status(201).json({ message: 'User created successfully', user: userDTO });
    })
    .catch((error) => {
      if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ error: 'Username already exists, try another one' });
        return
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    });
}

export const getAllUsers = async (req: Request, res: Response) => {
  const userReq = req.user;

  if (!userReq) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  if (userReq.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized: You are not authorized to perform this action' });
    return;
  }

  await User.sync();

  await User.findAll()
    .then((users) => {
      const usersDTO = users.map((user) => {
        return {
          id: user.id,
          username: user.username,
          role: user.role,
          is_active: user.is_active,
        }
      })
      res.status(200).json({ message: 'Users found', users: usersDTO });
    })
    .catch((error) => {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get users' });
    });
}

export const updateUserNameOrState = async (req: Request, res: Response) => {
  const { username, is_active } = req.body;
  const userReq = req.user;

  if (!userReq) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  if (userReq.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized: You are not authorized to perform this action' });
    return;
  }

  if (!username || is_active === undefined) {
    res.status(400).json({ error: 'Username and is_active are required' });
    return
  }

  await User.sync();

  await User.update({ is_active }, { where: { username } })
    .then(() => {
      res.status(200).json({ message: 'User status updated successfully' });
    })
    .catch((error) => {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    });
}
  
export const deleteUser = async (req: Request, res: Response) => {
  const { username } = req.body;
  const userReq = req.user;

  if (!userReq) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  if (userReq.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized: You are not authorized to perform this action' });
    return;
  }

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return
  }

  await User.sync();

  await User.destroy({ where: { username } })
    .then(() => {
      res.status(200).json({ message: 'User deleted successfully' });
    })
    .catch((error) => {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    });
}

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' })
    return
  }

  await User.sync();

  await User.findOne({ where: { username } })
    .then(async (user) => {
      if (!user) {
        res.status(401).json({ error: 'Invalid username or password' })
        return
      }

      // Validar que el usuario esté activo
      if (!user.is_active) {
        res.status(403).json({ error: 'User account is inactive. Contact administrator.' })
        return
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid username or password' })
        return
      }

      const userDTO = {
        id: user.id,
        username: user.username,
        role: user.role,
      }

      jwt.sign(userDTO, JWT_SECRECT, { expiresIn: '4h' }, (err, token) => {
        if (err) {
          console.log(err.message);
          res.status(401).json({ message: err.message })
          return
        };

        res.status(200)
          .cookie(
            "token",
            token,
            {
              httpOnly: ENV === 'dev' ? false : true,
              secure: ENV === 'dev' ? false : true,
              sameSite: ENV === 'dev' ? 'lax' : 'none'
            }
          )
          .json({ message: 'Login successful', user: userDTO });
      });
    })
    .catch((error) => {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'Failed to log in user' });
    });
}

export const UserByToken = async (req: Request, res: Response) => {
  try {
    const cookie = req.headers.cookie

    if (!cookie) {
      res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
      return;
    }

    const token = cookie.split('=')[1];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRECT);
      res.status(200).json({ message: 'User found', user: decoded });
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expired' });
        return
      }
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(500).json({ error: 'Failed to verify token' });
  }
}

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (err) {
    console.error('Error logging out user:', err);
    res.status(500).json({ error: 'Failed to log out user' });
  }
}