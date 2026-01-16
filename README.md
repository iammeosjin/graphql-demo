# GraphQL Demo

A simple GraphQL API built with Node.js, TypeScript, Apollo Server, and PostgreSQL.

## Stack

### Backend

- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Express 5** - Web framework
- **Apollo Server 5** - GraphQL server
- **pg** - PostgreSQL client for Node.js

### GraphQL

- **GraphQL** - Query language and runtime
- **GraphQL Tools** - Schema merging and file loading utilities
- **GraphQL Scalars** - Custom scalar types (EmailAddress, PhoneNumber)

### Development & Testing

- **Jest** - Testing framework
- **ts-node** - TypeScript execution for Node.js
- **nodemon** - Development server with auto-reload
- **@faker-js/faker** - Test data generation

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Docker and Docker Compose (for running PostgreSQL)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following default configuration:

- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: password
- **Database**: graphqldemo

### 3. Environment Variables

Create a `.env` file in the root directory (optional, defaults are used if not provided):

```env
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=graphqldemo
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432
```

### 4. Build the Project

```bash
npm run build
```

## Running the Application

### Development Mode

Run the application in development mode with auto-reload:

```bash
npm run dev
```

The server will start at `http://localhost:4000/graphql`

### Production Mode

Build and run the compiled JavaScript:

```bash
npm run build
npm start
```

### Accessing GraphQL Playground

Once the server is running, you can access the GraphQL Playground at:

- **URL**: `http://localhost:4000/graphql`

## Running Tests

### Prerequisites for Testing

Tests require a separate test database. The test setup will automatically create test databases, but you need to ensure PostgreSQL is running.

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run a Specific Test File

```bash
npm test tests/api/register.test.ts
```
