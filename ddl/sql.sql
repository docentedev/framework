-- public.files definition

-- Drop table

-- DROP TABLE public.files;

CREATE TABLE public.files (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	filename varchar NOT NULL,
	"extension" varchar NOT NULL,
	route varchar NOT NULL,
	CONSTRAINT files_pk PRIMARY KEY (id)
);
CREATE INDEX files_id_idx ON public.files USING btree (id);

-- public.posts definition

-- Drop table

-- DROP TABLE public.posts;

CREATE TABLE public.posts (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	title varchar NOT NULL,
	extra json NOT NULL,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"content" varchar NULL,
	thumbnail uuid NULL,
	slug varchar NULL,
	excerpt varchar NULL,
	CONSTRAINT posts_pk PRIMARY KEY (id),
	CONSTRAINT posts_un UNIQUE (slug)
);

-- public.posts foreign keys

ALTER TABLE public.posts ADD CONSTRAINT fk_author_bookstore FOREIGN KEY (thumbnail) REFERENCES public.files(id);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid NULL DEFAULT uuid_generate_v4(),
	username text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT users_username_key UNIQUE (username)
);