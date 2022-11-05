import { Client } from 'pg'
import { Express, Request, Response } from 'express'
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import verifyToken from './middleware/validateToken';

dotenv.config();

// scrypt is callback based so with promisify we can await it
const scryptAsync = promisify(scrypt);

export class Password {
    static async toHash(password: string) {
        const salt = randomBytes(8).toString("hex");
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${buf.toString("hex")}.${salt}`;
    }
    static async compare(storedPassword: string, suppliedPassword: string) {
        // split() returns array
        const [hashedPassword, salt] = storedPassword.split(".");
        // we hash the new sign-in password
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
        // compare the new supplied password with the stored hashed password
        return buf.toString("hex") === hashedPassword;
    }
}

// 7911f626d2c71717a77eda7be27782489a7c544edc876a9da301c2a3eb29675884b1e76cf51a08f94f7612cda6783270bfda532581c0cd0b078c0c3a1bb7e141.2990aff89d7a69ca
Password.toHash('abc123').then((result) => {
    Password.compare(result, 'abc1232').then((res) => {
        console.log(res)
    })
})

const routes = (app: Express, client: Client) => {
    app.get('/dashboard/users/create', (req: Request, res: Response) => {
        res.render('dashboard-users-create')
    })

    /*
    var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, "days").unix(),
  };
  */
    app.post('/api/v1/users/login', async (req: Request, res: Response) => {
        /*
        jwt.sign({
  data: 'foobar'
}, 'secret', { expiresIn: 60 * 60 });
 
//or even better:
 
jwt.sign({
  data: 'foobar'
}, 'secret', { expiresIn: '1h' });

*/
        const token = jwt.sign({
            data: { name: 'user.name', id: 'user._id' },
            // Signing a token with 1 hour of expiration:
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
        }, process.env.TOKEN_SECRET || '')
        res.header('auth-token', token).json({
            error: null,
            data: { token }
        })
    })

    app.post('/api/v1/users/verify', verifyToken, async (req: Request, res: Response) => {
        res.json({
            success: true,
        })
    })

    app.post('/api/v1/users', async (req: Request<{
        username: string,
        password: string,
    }>, res: Response) => {
        const user = {
            username: req.body.username,
            password: await Password.toHash(req.body.password)
        }
        const text = "INSERT INTO public.users (id, username, password) VALUES(uuid_generate_v4(), $1, $2) RETURNING *"
        const values = [user.username, user.password]
        try {
            console.log(text, values)
            const result = await client.query(text, values)
            res.json(result)
        } catch (error: any) {
            res.status(400)
            if (error.code === '23505') {
                res.json({
                    error: 'Usuario ya se encuentra registrado'
                })
            } else {
                res.json({
                    error: error.message,
                })
            }
        }
    })
}

export default routes
