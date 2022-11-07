import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class Jwt {
  static sign(id: string, username: string) {
    return jwt.sign(
      {
        data: { name: username, id },
        // Signing a token with 1 hour of expiration:
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      process.env.TOKEN_SECRET || ""
    );
  }
}
