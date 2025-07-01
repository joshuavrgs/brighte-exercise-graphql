import { ApolloServer, gql } from "apollo-server";
import { typeDefs } from "../schema";
import { resolvers } from "../resolvers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const testServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ prisma }),
  });
};

describe("Mutation Register -- test cases", () => {
  let server: ApolloServer;

  let mockLead = {
    name: "Bruce Banner",
    email: "brucebanner@avangers.com",
    mobile: "1234567890",
    postcode: 12345,
    services: ["delivery", "pick-up", "payment"],
  };

  beforeAll(() => {
    server = testServer();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a new lead successfully", async () => {
    const result = await server.executeOperation({
      query: gql`
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            name
            email
            mobile
            postcode
            services
          }
        }
      `,
      variables: {
        input: mockLead,
      },
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.register).toBeDefined();
    expect(result.data?.register).toMatchObject({
      name: mockLead.name,
      email: mockLead.email,
      mobile: mockLead.mobile,
      postcode: mockLead.postcode,
      services: expect.arrayContaining(mockLead.services),
    });

    // delete the lead after test
    await prisma.lead.delete({
      where: { id: Number(result.data?.register.id) },
    });
  });

  it("should return error when required fields are missing", async () => {
    //Missing required 'email' field
    const incompleteInput = {
      name: "Bruce Banner",
      mobile: "1234567890",
      postcode: 12345,
      services: ["delivery", "pick-up", "payment"],
    };
    const result = await server.executeOperation({
      query: gql`
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            name
            email
            mobile
            postcode
            services
          }
        }
      `,
      variables: {
        input: incompleteInput,
      },
    });
    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toMatch(
      /Field "email" of required type "String!" was not provided/
    );
    expect(result.errors![0]!.extensions?.code).toBe("BAD_USER_INPUT");
  });
});
