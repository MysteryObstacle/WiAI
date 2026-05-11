export default {
  schema: "./src/schema.ts",
  out: "./src/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.WIAI_DATABASE_URL ?? "file:./.data/wiai.sqlite"
  }
};
