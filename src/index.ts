import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    //To have sync between entity and table schemas
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
                //disableTouch to set sesion forever otherwise each time the user performs an action it will touch redis to extend user's sesion
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
                httpOnly: true, //disallow accesing cookies in front-end
                sameSite: 'lax', //csrf
                secure: __prod__ //https only in prod
            },
            saveUninitialized: false, //Don't store empty sessions
            secret: "qwertyuiop",
            resave: false
        })
    );

    const appolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        //Special object accesible by all the resolvers
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
    });

    appolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log("Started server on localhost:4000");
    });
};
main().catch((err) => {
    console.error(err);
});
