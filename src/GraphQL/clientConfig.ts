// lib/apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql/bill", // your API endpoint
    fetch, // required in Next.js server environment sometimes
  }),
  cache: new InMemoryCache(),
});
