import express from 'express';
import { get, merge } from 'lodash';

import { getUserBySessionToken } from '../db/users';

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sessionToken = req.cookies['sessionToken'];

        if(!sessionToken) {
            return res.status(403).send('No token provided');
        }

        const existingUser = await getUserBySessionToken(sessionToken);

        if(!existingUser) {
            return res.status(403).send('Invalid token');
        }

        merge(req, { identity: existingUser });

        return next();
    } catch(error) {
        return res.status(400).send('Something went wrong');
    }
};

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const userId = get(req, 'identity._id') as string;

        if(!userId) {
            return res.status(403).send('You are not authorized to perform this action');
        }

        if(userId.toString() !== id) {
            return res.status(403).send('You are not authorized to perform this action');
        }

        return next();
    } catch(error) {
        return res.status(400).send('Something went wrong');
    }
};