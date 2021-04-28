import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";
//import session from "express-session";

//Declaration merging allows us to add properties to express session
declare module "express-session" {
    export interface SessionData {
        userId: number;
    }
}
//Other way to set arguments on graphql resolvers
//This is the other way
/* @Resolver()
export class UserResolver {
    @Mutation(() => String)
    register(
        @Arg("username", () => String) username: string,
        @Arg("password", () => String) password: string,
        @Ctx() { em }: MyContext
    ) {    }
} */

//InputTypes is for arguments, can't be passed to Mutations
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

//ObjectType can be passed as argunment to Mutations
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: MyContext) {
        return !req.session.userId ? null : await em.findOne(User, { id: req.session.userId });
    }

    @Mutation(() => UserResponse)
    async register(
        //If Graphql returns an error related to the Arg type, we solve it by specifying the type explicitly
        //@Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "Username length must be greater than 2"
                    }
                ]
            };
        }

        if (options.password.length <= 3) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Password length must be greater than 3"
                    }
                ]
            };
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, { username: options.username, password: hashedPassword });
        try {
            await em.persistAndFlush(user);
        } catch (err) {
            //Duplicate username error
            if (err.code === "23505") {
                /*  || err.detail.includes("already exists")) { */
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Username already taken"
                        }
                    ]
                };
            }
        }
        req.session.userId = user.id;
        return { user };
    }

    @Mutation(() => UserResponse)
    async login(@Arg("options") options: UsernamePasswordInput, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username });
        //How to handle errors on graphqul resolvers
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "That username doesn't exist"
                    }
                ]
            };
        }

        const valid = await argon2.verify(user.password, options.password);
        1;

        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Incorrect password"
                    }
                ]
            };
        }
        req.session!.userId = user.id;
        return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        console.log("Logout call");
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME);
                if(err) {
                    console.error(err);
                    resolve(false);
                    return
                }
                resolve(true);
            })
        );
    }
}
