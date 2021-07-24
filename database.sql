
DROP DATABASE IF EXISTS launchstore;
CREATE DATABASE launchstore;

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "category_id" int NOT NULL, --estava dando erro pq aqui estava como "category_id" int UNIQUE
  "user_id" int, --e aqui estava como "user_id" int UNIQUE
  "name" text NOT NULL,
  "description" text NOT NULL,
  "old_price" int,
  "price" int NOT NULL,
  "quantity" int DEFAULT 0,
  "status" int DEFAULT 1,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

-- o NOT NULL na frente dos nomes, significa que não pode mandar um dado vazio */

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL
);

INSERT INTO categories(name) VALUES ('comida');
INSERT INTO categories(name) VALUES ('eletrônicos');
INSERT INTO categories(name) VALUES ('automóveis');
INSERT INTO categories(name) VALUES ('roupas');

CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "path" text NOT NULL,
  "product_id" int NOT NULL
);



  --na tabela produto existe uma chave estrangeira na categoria id
  --e ela está referenciando a tabela de categorias no campo id



  --alterando uma tabela, estou adicionando uma chave estrangeira na categoria id,
  --e a referência dela é categories id 

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");
ALTER TABLE "files" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");



/* USERS */
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,

   --email - UNIQUE, ou seja não pode ter dois emails iguais(único)
  "email" text UNIQUE NOT NULL,

  "password" text NOT NULL,
  "cpf_cnpj" text UNIQUE NOT NULL,
  "cep" text,
  "address" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

-- foreign key
ALTER TABLE "products" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- create procedure
CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;


-- auto updated_at products
CREATE TRIGGER trigger_set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();  

-- auto updated_at users
CREATE TRIGGER trigger_set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp(); 


-- connect pg simple table, tabela para segurar a sessão
-- criando tabela
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid")



-- token password recovery
--na coluna de users
ALTER TABLE "users" ADD COLUMN reset_token text;
ALTER TABLE "users" ADD COLUMN reset_token_expires text;





-- refazendo a CONSTRAINT, agora com uma ideia de deletamento em cascata
-- cascade efect when delete user and products
-- vai deletar o usuário com seus produtos cadastrados, juntamente com os arquivos dos produtos
ALTER TABLE "products"
DROP CONSTRAINT products_user_id_fkey,
ADD CONSTRAINT products_user_id_fkey
FOREIGN KEY ("user_id")
REFERENCES "users" ("id")
ON DELETE CASCADE;

ALTER TABLE "files"
DROP CONSTRAINT files_product_id_fkey,
ADD CONSTRAINT files_product_id_fkey
FOREIGN KEY ("product_id")
REFERENCES "products" ("id")
ON DELETE CASCADE;