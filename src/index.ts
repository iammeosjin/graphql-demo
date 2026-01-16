import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import LeadRepository from './repositories/lead';

dotenv.config();

const typeDefs = mergeTypeDefs(
  loadFilesSync(path.join(__dirname, './schemas')),
);

const resolvers = mergeResolvers(
  loadFilesSync(path.join(__dirname, './resolvers')),
);

const startServer = async () => {
  await LeadRepository.ensureTableExists();

  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server),
  );

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
};

startServer();
