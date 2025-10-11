import { Request, Response } from "express";
import { User } from "../models/user.m";

export const registerNewUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return 
  }

  await User.sync();

  await User.create({ username, password })
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
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'Invalid username or password' })
        return 
      }
      res.status(200).json({ message: 'User logged in successfully', user });
    })
    .catch((error) => {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'Failed to log in user' });
    });
}
