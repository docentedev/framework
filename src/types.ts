export type PostSave = {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  extra: {
    public: boolean;
  };
  thumbnail: string;
};

export type Post = {
  id: string;
} & PostSave;

export type UserSave = {
  username: string;
  password: string;
};

export type User = {
  id: string;
} & UserSave;
