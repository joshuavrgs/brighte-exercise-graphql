import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  //create services
  const serviceTypes = ["delivery", "pick-up", "payment"];
  const serviceMap = new Map<string, number>();

  for (const type of serviceTypes) {
    const service = await prisma.leadService.upsert({
      where: { type },
      update: {},
      create: { type },
    });
    serviceMap.set(type, service.id);
  }

  // Create sample leads
  const sampleLeads = [
    {
      name: "Tony Stark",
      email: "tony@starkindustries.com",
      mobile: "555-0001",
      postcode: 1604,
      services: ["delivery", "pick-up", "payment"],
    },
  ];

  for (const lead of sampleLeads) {
    await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        mobile: lead.mobile,
        postcode: lead.postcode,
        services: {
          connect: lead.services.map((service) => ({
            id: serviceMap.get(service)!,
          })),
        },
      },
    });
  }

  console.log("Seeded services and leads");

  const leads = await prisma.lead.findMany();
  console.log("Leads:", leads);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
