import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    leads: async () => {
      const leads = await prisma.lead.findMany({
        include: {
          services: true,
        },
      });

      return leads.map((lead) => ({
        ...lead,
        services: lead.services.map((s) => s.type),
      }));
    },
    lead: async (_: any, { id }: { id: String }) => {
      const lead = await prisma.lead.findUnique({
        where: { id: Number(id) },
        include: {
          services: true,
        },
      });

      if (!lead) {
        throw new GraphQLError(`Lead with ID ${id} not found`, {
          extensions: {
            code: "NOT_FOUND",
          },
        });
      }

      return {
        ...lead,
        services: lead?.services.map((s) => s.type),
      };
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      const { name, email, mobile, postcode, services } = input;

      const lead = await prisma.lead.create({
        include: {
          services: true,
        },
        data: {
          name,
          email,
          mobile,
          postcode,
          services: {
            connect: services.map((service: string) => ({ type: service })),
          },
        },
      });

      return {
        ...lead,
        services: lead.services.map((s) => s.type),
      };
    },
  },
};
