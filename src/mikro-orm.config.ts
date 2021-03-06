import { __prod__ } from "./constants";
import { Post } from "./entities/Posts";
import { MikroORM } from "@mikro-orm/core";
import { User } from "./entities/User";
import path from "path";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/,
        disableForeignKeys: false
    },
    entities: [Post, User],
    dbName: 'reddot',
    type: 'postgresql',
    debug: !__prod__,
    user: 'reddot_user',
    password: 'reddot_password'
} as Parameters<typeof MikroORM.init>[0];