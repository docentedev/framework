import { Client } from "pg";
import { Express, Request, Response } from "express";
import { Post } from "../types";

const publicRoutes = (app: Express, client: Client) => {
  app.get("/", (req: Request, res: Response) => {
    client.query<Post>(
      'select p.id, f.filename as filename, p.title, p."content", f."extension", p.slug, p.excerpt  from posts as p left join files as f on f.id = p.thumbnail',
      (err: any, data) => {
        res.render("public", {
          posts: data.rows,
        });
      }
    );
  });

  app.get("/posts/:slug", (req: Request, res: Response) => {
    const slug = req.params.slug;
    client.query<Post>(
      'select p.id, f.filename as filename, p.title, p."content", f."extension", p.slug, p.excerpt  from posts as p left join files as f on f.id = p.thumbnail where p.slug = $1',
      [slug],
      (err: any, data) => {
        if (data.rows[0]) {
          res.render("public-post", {
            post: data.rows[0],
          });
        } else {
          res.render("public-post-void");
        }
      }
    );
  });

  app.get("/login", (req: Request, res: Response) => {
    res.render("public-login");
  });
};

export default publicRoutes;
