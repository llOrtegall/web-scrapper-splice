import { ENV, JWT_SECRECT, ROUNDS_SALT } from '../schemas/env'
import { Request, Response } from "express";
import { User } from "../models/user.m";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerNewUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return
  }

  await User.sync();

  const hashedPassword = await bcrypt.hash(password, ROUNDS_SALT);

  await User.create({ username, password: hashedPassword })
    .then((user) => {
      res.status(201).json({ message: 'User created successfully', user });
    })
    .catch((error) => {
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

      const token = jwt.sign(userDTO, JWT_SECRECT, { expiresIn: '1h' });
      res.status(200).json({ message: 'User logged in successfully', userDTO, token });
    })
    .catch((error) => {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'Failed to log in user' });
    });
}
