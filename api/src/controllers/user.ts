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

      jwt.sign(userDTO, JWT_SECRECT, { expiresIn: '2m' }, (err, token) => {
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
