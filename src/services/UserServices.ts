import { Client } from "pg";
import { Express, Request, Response } from "express";
import dotenv from "dotenv";
import verifyToken from "../middleware/validateToken";
import { Password } from "../utils/Password";
import { Jwt } from "../utils/Jwt";
import { User } from "../types";
import UserRepository from "../repositories/UserRepository";
import { getFirstNChar } from "../utils";

dotenv.config();

const routes = (app: Express, client: Client) => {
  const repository = new UserRepository(client);
  // Views
  app.get("/dashboard/users/create", (req: Request, res: Response) => {
    res.render("dashboard-users-create");
  });

  app.get("/dashboard/users", async (req: Request, res: Response) => {
    const users = await repository.findAll();
    res.render("dashboard-users", {
      users: users.rows.map((user) => ({
        ...user,
        id: getFirstNChar(user.id, 10, "..."),
        password: getFirstNChar(user.password, 30, "..."),
      })),
    });
  });

  // Endpoints
  app.get("/api/v1/users", async (req: Request, res: Response) => {
    const result = await repository.findAll();
    res.json(result.rows);
  });

  app.post("/api/v1/users/login", async (req: Request, res: Response) => {
    let dbRes;
    try {
      dbRes = await repository.login(req.body);
    } catch (error) {
      return res.status(500).json({
        error: "DB Error",
      });
    }
    if (dbRes.rowCount === 0) {
      return res.status(400).json({
        error: "Bad credentials",
      });
    }

    if (dbRes.rowCount === 1) {
      const resCompare = await Password.compare(
        dbRes.rows[0].password,
        req.body.password
      );
      if (!resCompare) {
        return res.status(400).json({
          error: "Bad credentials",
        });
      }
    }
    const id = dbRes.rows[0].id;
    const username = req.body.username;

    const token = Jwt.sign(id, username);
    res.header("auth-token", token).json({
      error: null,
      token,
    });
  });

  app.post(
    "/api/v1/users/verify",
    verifyToken,
    async (req: Request, res: Response) => {
      res.json({
        success: true,
      });
    }
  );

  app.post("/api/v1/users", async (req: Request<User>, res: Response) => {
    const user = {
      username: req.body.username,
      password: await Password.toHash(req.body.password),
    };
    try {
      const dbResult = repository.save(user);
      res.json((await dbResult).rows[0]);
    } catch (error: any) {
      res.status(400);
      if (error.code === "23505") {
        res.json({
          error: "Usuario ya se encuentra registrado",
        });
      } else {
        res.json({
          error: error.message,
        });
      }
    }
  });
};

export default routes;

/*
    var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, "days").unix(),
  };
  */
/*
        jwt.sign({
  data: 'foobar'
}, 'secret', { expiresIn: 60 * 60 });
 
//or even better:
 
jwt.sign({
  data: 'foobar'
}, 'secret', { expiresIn: '1h' });

*/
