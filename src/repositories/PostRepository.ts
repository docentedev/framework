import { Client } from "pg";
import { Post, PostSave } from "../types";

class PostRepository {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  findAll = async () => {
    const text =
      'select p.id, f.filename as filename, p.title, p."content", f."extension", p.slug, p.excerpt  from posts as p left join files as f on f.id = p.thumbnail';
    try {
      const result = await this.client.query<Post>(text);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  save = async (post: PostSave) => {
    const text = `
        INSERT INTO posts 
        (id, title, extra, created_at, updated_at, deleted_at, "content", thumbnail, excerpt, slug) VALUES
        (uuid_generate_v4(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4, $5, $6)
        RETURNING * `;
    const values = [
      post.title,
      post.extra,
      post.content,
      post.thumbnail,
      post.excerpt,
      post.slug,
    ];
    try {
      const result = await this.client.query<PostSave>(text, values);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

export default PostRepository;
