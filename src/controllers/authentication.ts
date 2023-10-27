import express from 'express';
import { getUserByEmail, createUser } from '../db/users';
import { random, authentication } from '../helpers';

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { username, email, password } = req.body;
        

        if(!email || !password || !username) {
            return res.status(400).send('Missing fields');
        }

        const existingUser = await getUserByEmail(email);
        if(existingUser) {
            return res.status(400).send('User already exists');
        }
        
        const salt = random();

        const user = await createUser({
            username,
            email,
            authentication: {
                salt,
                password: authentication(password, salt),
            }
        });

        if(!user) {
            return res.status(400).send('User could not be created');
        }

        return res.status(200).json(user);
    } catch(error) {
        return res.status(400).send('Something went wrong');
    }
};

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).send('Missing fields');
        }

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');
        if(!user) {
            return res.status(400).send('User does not exist');
        }

        const { salt: userSalt, password: userPassword } = user.authentication;

        const expectedPassword = authentication(password, userSalt);

        if(expectedPassword !== userPassword) {
            return res.status(403).send('Wrong password');
        }
        
        const salt = random();
        user.authentication.sessionToken = authentication(user._id.toString(), salt);

        await user.save();

        res.cookie('sessionToken', user.authentication.sessionToken, {
            domain: 'localhost',
            path: '/'
        });

        return res.status(200).json(user);
    } catch(error) {
        return res.status(400).send('Something went wrong');
    }
};