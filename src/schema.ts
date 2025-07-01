export const typeDefs = `#graphql
  type Query {
    leads: [Lead!]!
    lead(id: ID!): Lead
  }
  type Lead {
    id: ID!
    name: String!
    email: String!
    mobile: String!
    postcode: Int!
    services: [String!]!
  }

  type Mutation {
    register(input: RegisterInput!): Lead
    deleteLead(id: ID!): [Lead!]!
  }
  input RegisterInput {
    name: String!
    email: String!
    mobile: String!
    postcode: Int!
    services: [String!]!
  }
`;
