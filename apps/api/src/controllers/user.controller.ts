import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";

export const getUsersController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();

    res.json(users);
  } catch (error) {
    next(error);
  }
}

export const getUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(Number(id));

    if (!user) {
      res.status(404).json({message: "User not found"});
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    const newUser = await userService.createUser({name, email});

    res.status(201).json(newUser);

  } catch (error) {
    next(error);
  }
}

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(Number(id), req.body);

    if (!updatedUser) {
      res.status(404).json({message: "User not found"});
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
}

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(Number(id));

    if (result.affected === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 204 No Content
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}