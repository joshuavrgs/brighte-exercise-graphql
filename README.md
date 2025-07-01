## 📄 Technical Exercise Instructions

Brighte would like to provide a system to accept expressions of interest for a new product and to view those leads in a dashboard. The new
product is called Brighte Eats. We would like to know which of the following services customers are interested in:

- delivery
- pick-up
- payment

We would like you to create an API for this purpose.

### Requirements:

- Relational database
- GraphQL API written in Typescript to run on NodeJs
- 1 mutation: register - will accept name, email, mobile, postcode, and which services they are interested in
- 2 queries: leads and lead, to provide all the data
- Code should be on GitHub. We would prefer to see commits as you go
- A README is a must
- We should be able to check out and run the solution
- We would like to see some unit tests

During the interview you will be asked to give a tour of your completed work, explaining what you’ve done and the pros and cons of your
solution. We will ask you to make changes to your solution to suit additional requirements. It will be important for you to be able to explain
what you have created.

---

# GraphQL API

A GraphQL API built with **TypeScript**, **Apollo Server**, and **Prisma (SQLite)** to manage customer interest in the "Brighte Eats" product. It allows users to register their interest in services (delivery, pick-up, payment) and lets administrators query all or individual lead.

---

## 🛠️ Tech Stack

- **GraphQL** with Apollo Server
- **Node.js** + **TypeScript**
- **Prisma ORM** (SQLite)
- **Jest** for unit testing

---

## 🚀 Getting Started

### 1️⃣ Clone and Install

```bash
git clone https://github.com/your-username/brighte-exercise-graphql.git
cd brighte-exercise-graphql
npm install
```

### 2️⃣ Set Up Prisma

Create and migrate the database:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed static services and a sample lead:

```bash
npm run seed
```

### 3️⃣ Start the Server

```bash
npm run dev
```

> Visit GraphQL Playground: [http://localhost:4000](http://localhost:4000)

---

## 🧪 Running Tests

```bash
npm run test
```

Test files are located in:  
`src/__test__/mutation.test.ts`  
`src/__test__/query.test.ts`

---

## 🔧 API Reference

### 📘 Query: `leads`

```graphql
query {
  leads {
    id
    name
    email
    mobile
    postcode
    services
  }
}
```

### 📘 Query: `lead(id: ID!)`

```graphql
query {
  lead(id: 1) {
    name
    email
    mobile
    services
  }
}
```

### ✅ Mutation: `register`

```graphql
mutation Register($input: RegisterInput!) {
  register(
    input: {
      name: "Tony Stark"
      email: "tony@starkindustries.com"
      mobile: "555-0001"
      postcode: 1604
      services: ["delivery", "payment", "pick-up"]
    }
  ) {
    id
    name
    email
    mobile
    postcode
    services
  }
}
```

---

## 🧱 Database Schema (Prisma)

```prisma
model Lead {
  id        Int           @id @default(autoincrement())
  createdAt DateTime      @default(now())
  name      String
  email     String
  mobile    String
  postcode  Int
  services  LeadService[] @relation("LeadToService")
}

model LeadService {
  id    Int    @id @default(autoincrement())
  type  String @unique
  leads Lead[] @relation("LeadToService")
}
```
