import jwt from 'jsonwebtoken'
import { Express, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv';

dotenv.config();

// middleware to validate token (rutas protegidas)
const verifyToken = (req: any, res: Response, next: NextFunction) => {
    let token = ''
    try {
        token = req.headers.authorization.split(" ")[1];
    } catch (error) {
        return res.status(401).json({
            error: 'Falta token',
        })
    }
    if (!token) return res.status(401).json({ error: 'Acceso denegado' })
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET || '')
        req.user = verified
        next() // continuamos
    } catch (error) {
        res.status(400).json({ error: 'token no es válido' })
    }
}

export default verifyToken
