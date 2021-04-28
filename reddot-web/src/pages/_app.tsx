import { ChakraProvider } from "@chakra-ui/react";
import { Provider, createClient, dedupExchange, fetchExchange } from "urql";
import { cacheExchange, QueryInput, Cache } from '@urql/exchange-graphcache';

import theme from "../theme";
import { AppProps } from "next/app";
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";

function betterUpdateQuery<Result, Query>(
    cache: Cache,
    queryInp: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
) {
    return cache.updateQuery(queryInp, data => fn(result, data as any) as any);
}

const client = createClient({
    url: "http://localhost:4000/graphql",
    exchanges: [dedupExchange, cacheExchange({
        updates: {
            //Updates cache when an user mutation happens
            Mutation: {
                login: (_result, args, cache, info) => {
                    betterUpdateQuery<LoginMutation, MeQuery>(
                        cache, 
                        {query: MeDocument},
                         _result,
                         (result, query) => {
                            if (result.login.errors) return query;
                            return {
                                me: result.login.user,
                            }
                         }
                    );
                },
                register: (_result, args, cache, info) => {
                    betterUpdateQuery<RegisterMutation, MeQuery>(
                        cache, 
                        {query: MeDocument},
                         _result,
                         (result, query) => {
                            if (result.register.errors) return query;
                            return {
                                me: result.register.user,
                            }
                         }
                    );
                },
            }
        }
    }), fetchExchange],
    fetchOptions: {
      credentials: "include"
    }
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider value={client}>
            <ChakraProvider resetCSS theme={theme}>
                <Component {...pageProps} />
            </ChakraProvider>
        </Provider>
    );
}

export default MyApp;
