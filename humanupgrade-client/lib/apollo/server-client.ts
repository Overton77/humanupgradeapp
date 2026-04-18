import { HttpLink } from '@apollo/client'
import { ApolloClient, InMemoryCache, registerApolloClient } from '@apollo/client-integration-nextjs'

/**
 * Server-side Apollo client for React Server Components.
 *
 * Use:
 *   const { data } = await getClient().query({ query: SomeDocument, variables: { ... } })
 *
 * For RSC the client is a singleton per request, with no in-memory caching across requests.
 */
export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      // RSC fetches: short cache; entity pages can override per-request.
      fetchOptions: { next: { revalidate: 60 } },
    }),
  })
})
