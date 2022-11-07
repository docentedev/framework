import { Client } from "pg";
import { Express, Request, Response } from "express";
import dotenv from "dotenv";
import sendMail from "./mail";
import https from "https";

dotenv.config();

const data = "{}";
const getOptions = (token: string) => ({
  protocol: "https:",
  hostname: "www.google.com",
  port: 443,
  path: `/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
});

const routes = (app: Express, client: Client) => {
  app.post("/api/v1/contact", (req: Request, res: Response) => {
    const reqHttps = https
      .request(getOptions(req.body.token), (resHttps) => {
        let data = "";

        resHttps.on("data", (chunk) => {
          data += chunk;
        });

        resHttps.on("end", () => {
          console.log(JSON.parse(data));
          sendMail({
            message: req.body.message,
            email: req.body.email,
            name: req.body.name,
          });
          res.json(JSON.parse(data));
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
        res.json(err.message);
      });

    reqHttps.write(data);
    reqHttps.end();
  });
};

export default routes;
