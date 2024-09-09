import { config as conf } from "dotenv";

conf();

const _config = {
    port: process.env.PORT,
    db: process.env.MONGO_CONNECTION,
    env: process.env.NODE_ENV
}

export const config = Object.freeze(_config);