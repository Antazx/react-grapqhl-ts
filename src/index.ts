import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";
 
const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const app = express();
    const appolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        //Special object accesible by all the resolvers
        context: (/**{ req, res } */) => ({ em: orm.em })
    })
    
    appolloServer.applyMiddleware({app});

    app.listen(4000, () => {
        console.log("Started server on localhost:4000");
    });
};
main().catch((err) => {
    console.error(err);
});
