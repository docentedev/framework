import { Client } from "pg";
import { User, UserSave } from "../types";

class UserRepository {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  findAll = async () => {
    const text = "select *  from users";
    try {
      const result = await this.client.query<User>(text);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  login = async (user: User) => {
    const text =
      "select u.id, u.password  from users as u where u.username = $1";
    const values = [user.username];
    try {
      const result = await this.client.query<User>(text, values);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };
  save = async (user: UserSave) => {
    const text =
      "INSERT INTO public.users (id, username, password) VALUES(uuid_generate_v4(), $1, $2) RETURNING *";
    const values = [user.username, user.password];

    try {
      const result = await this.client.query<User>(text, values);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

export default UserRepository;
