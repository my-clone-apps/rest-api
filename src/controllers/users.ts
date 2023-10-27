import express from 'express';

import {
    getUsers,
    deleteUserById,
    getUserById
} from '../db/users';

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await getUsers();

        return res.status(200).json(users);
    } catch(error) {
        return res.status(400).send('Something went wrong');
    }
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const user = await deleteUserById(id);

        if(!user) {
            return res.status(400).send('User does not exist');
        }

        return res.status(200).json(user);
    } catch(error) {
        return res.status(400).send('Something went wrong');
    }
};

export const updateUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        const user = await getUserById(id);

        if(!user) {
            return res.status(400).send('User does not exist');
        }

        user.username = username;
        user.save();

        return res.status(200).json(user);
    } catch(error) {
        return res.status(400).send('Something went wrong');
    }
};