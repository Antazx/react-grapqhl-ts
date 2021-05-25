import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { LoginMutation, MeQuery, MeDocument, RegisterMutation, LogoutMutation } from "../generated/graphql";
import { betterUpdateQuery } from "../utils/betterUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:4000/graphql",
    exchanges: [
        dedupExchange,
        cacheExchange({
            updates: {
                //Updates cache when an user mutation happens
                Mutation: {
                    logout: (_result, args, cache, info) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(cache, { query: MeDocument }, _result, () => ({ me: null }));
                    },
                    login: (_result, args, cache, info) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
                            if (result.login.errors) return query;
                            return {
                                me: result.login.user
                            };
                        });
                    },
                    register: (_result, args, cache, info) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
                            if (result.register.errors) return query;
                            return {
                                me: result.register.user
                            };
                        });
                    }
                }
            }
        }),
        ssrExchange,
        fetchExchange
    ],
    fetchOptions: {
        credentials: "include" as const
    }
});
