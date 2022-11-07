import { Client } from "pg";
import { Express, Request, Response } from "express";
import { getFirstNChar, getTextFromHtml, seoUrl } from "../utils";
import PostRepository from "../repositories/PostRepository";

const routes = (app: Express, client: Client) => {
  const repository = new PostRepository(client);
  app.get("/api/v1/posts", async (req: Request, res: Response) => {
    const result = await repository.findAll();
    res.json(result.rows);
  });

  app.post("/api/v1/posts", async (req: Request, res: Response) => {
    const data = req.body;
    const result = await repository.save({
      title: data.title,
      extra: { public: true },
      content: data.content,
      thumbnail: data.thumbnail,
      excerpt: getFirstNChar(getTextFromHtml(data.content), 70),
      slug: seoUrl(data.title),
    });
    res.json(result.rows);
  });
};

export default routes;
