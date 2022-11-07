import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import client from "./connection";
import upload from "./upload";
import publicRoutes from "./public";
import { Post } from "./types";

import userServices from "./services/UserServices";
import contactServices from "./contact.services";
import postServices from "./services/PostServices";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const server = "http://localhost";

const mainFolder = process.env.PWD || "";
// set the view engine to ejs
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(mainFolder, "views"));
app.use("/static", express.static(path.join(mainFolder, "public")));
app.use("/files", express.static(path.join(mainFolder, "files")));
app.use("/media", express.static(path.join(mainFolder, "uploads")));

postServices(app, client);
userServices(app, client);
contactServices(app, client);

upload(app, client);
publicRoutes(app, client);

app.get("/dashboard", (_req: Request, res: Response) => {
  res.render("dashboard");
});

app.get("/dashboard/posts", (_req: Request, res: Response) => {
  client.query<Post>(
    'select p.id, f.filename as filename, p.title, p."content", f."extension", p.slug, p.excerpt  from posts as p left join files as f on f.id = p.thumbnail',
    (err: any, data) => {
      res.render("dashboard-posts", {
        posts: data.rows.map((post) => ({
          ...post,
        })),
      });
    }
  );
});

app.get("/dashboard/endpoints", (req: Request, res: Response) => {
  res.render("dashboard-endpoints", {
    endpoints: [
      {
        method: "get",
        url: "/api/v1/files",
      },
      {
        method: "post",
        url: "/api/v1/files",
      },
      {
        method: "get",
        url: "/api/v1/posts",
      },
      {
        method: "post",
        url: "/api/v1/posts",
      },
      {
        method: "get",
        url: "/api/v1/users",
      },
    ].map((e) => ({ ...e, url: `${server}:${port}${e.url}` })),
  });
});

app.get("/dashboard/posts/create", (req: Request, res: Response) => {
  res.render("dashboard-posts-create");
});

/*
SELECT vehicle_number, dept_id, type
FROM employee
ORDER BY employee.id DESC
LIMIT 20
OFFSET 20;
*/

// API
app.get("/api/v1/files", (req: Request, res: Response) => {
  client.query<any>("select * from files", (err: any, data) => {
    res.json(data.rows);
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at ${server}:${port}`);
});
