import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config({ path: "./back/.env" });
const secretkey: string = process.env.SECRETKEY as string;
if (!secretkey)
    throw new Error("SECRETKEY is missing in .env");

export const createJWT = (id: number): string => {
    return jwt.sign({ user_id: id}, secretkey, { expiresIn: "1h", algorithm: "HS256" });
}

// export const checkJWT = async 
