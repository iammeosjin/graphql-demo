import { ApolloServer } from '@apollo/server';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import path from 'node:path';

export async function createTestServer() {
  const typeDefs = mergeTypeDefs(
    loadFilesSync(path.join(__dirname, '../../src/schemas')),
  );

  const resolvers = mergeResolvers(
    loadFilesSync(path.join(__dirname, '../../src/resolvers')),
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  return server;
}
