import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { useQuery } from 'react-query'

type StatKey = 'total-mints' | 'total-tokens' | 'total-wallets'
export const statsNames: StatKey[] = [
  'total-mints',
  'total-tokens',
  'total-wallets',
]

export const useGlobalStats = () => {
  const index = new ApolloClient({
    uri: 'https://prod-holaplex.hasura.app/v1/graphql',
    cache: new InMemoryCache({ resultCaching: false }),
  })

  return useQuery<
    | {
        [n: string]: { data: number }
      }
    | undefined
  >(['useGlobalStats'], async () => {
    const queryResult = await index.query({
      query: gql`
        query GetCardinalClaimEvents {
          q1: cardinal_token_managers_aggregate(
            where: { invalidation_type: { _eq: "4" } }
          ) {
            aggregate {
              count
            }
          }

          q2: cardinal_token_managers_aggregate(
            where: { invalidation_type: { _eq: "4" } }
            distinct_on: recipient_token_account
          ) {
            aggregate {
              count(distinct: true)
            }
          }
        }
      `,
    })

    const tokenManagers = queryResult.data as {
      q1?: { aggregate?: { count?: number } }
      q2?: { aggregate?: { count?: number } }
    }
    return {
      'total-mints': { data: 4 },
      'total-tokens': {
        data: tokenManagers.q1?.aggregate?.count ?? 0,
      },
      'total-wallets': { data: tokenManagers.q2?.aggregate?.count ?? 0 },
    }
  })
}

export const statsNameMapping: { key: StatKey; displayName: string }[] = [
  {
    key: 'total-mints',
    displayName: 'Total Mints',
  },
  {
    key: 'total-tokens',
    displayName: 'Total Tokens',
  },
  {
    key: 'total-wallets',
    displayName: 'Unique Wallets',
  },
]
