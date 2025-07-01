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

describe("Query Leads -- test cases", () => {
  let server: ApolloServer;

  beforeAll(() => {
    server = testServer();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return all data from Query Leads", async () => {
    const result = await server.executeOperation({
      query: gql`
        query {
          leads {
            name
            mobile
            email
            postcode
            services
          }
        }
      `,
    });
    const expectedLeads = await prisma.lead
      .findMany({
        include: { services: true },
      })
      .then((leads) =>
        leads.map(({ id, createdAt, ...lead }) => ({
          ...lead,
          services: lead.services.map((s) => s.type),
        }))
      );
    expect(result.data?.leads).toEqual(expectedLeads);
  });

  it("should return an data with no services parameter", async () => {
    const result = await server.executeOperation({
      query: gql`
        query {
          leads {
            name
            mobile
            email
            postcode
          }
        }
      `,
    });
    const expectedLeads = await prisma.lead.findMany().then((leads) =>
      leads.map(({ id, createdAt, ...lead }) => ({
        ...lead,
      }))
    );
    expect(result.data?.leads).toEqual(expectedLeads);
  });

  it("should return an error for invalid parameter", async () => {
    const result = await server.executeOperation({
      query: gql`
        query {
          leads {
            invalidField
          }
        }
      `,
    });

    expect(result.errors).toBeDefined();
  });
});

describe("Query Lead -- test cases", () => {
  let server: ApolloServer;

  beforeAll(() => {
    server = testServer();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return a data by ID", async () => {
    const lead = await prisma.lead.findFirst({
      where: { id: 1 },
      include: { services: true },
    });
    if (!lead) {
      throw new Error("Lead with ID 1 not found");
    }
    const result = await server.executeOperation({
      query: gql`
        query GetLead($id: ID!) {
          lead(id: $id) {
            name
            mobile
            email
            postcode
            services
          }
        }
      `,
      variables: { id: "1" },
    });

    const expectedLead = await prisma.lead
      .findUnique({
        where: { id: 1 },
        include: { services: true },
      })
      .then((lead) => {
        if (!lead) throw new Error("Lead with ID 1 not found");
        const { id, createdAt, services, ...rest } = lead;
        return {
          ...rest,
          services: services.map((s: { type: string }) => s.type),
        };
      });

    expect(result.data?.lead).toEqual(expectedLead);
  });

  it("should return an error for non-existent ID", async () => {
    const result = await server.executeOperation({
      query: gql`
        query GetLead($id: ID!) {
          lead(id: $id) {
            name
          }
        }
      `,
      variables: { id: "9999" }, // Assumingg 9999 is not existing
    });

    expect(result.errors).toBeDefined();
    expect(result.data?.lead).toBeNull();
    expect(result.errors![0].message).toBe("Lead with ID 9999 not found");
    expect(result.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");
  });
});
