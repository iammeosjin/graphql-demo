import LeadRepository, { Lead } from '../repositories/lead';

export const leadResolvers = {
  Query: {
    lead: async (_: never, { id }: { id: string }) => {
      return await LeadRepository.findById(id);
    },
    leads: async () => {
      return await LeadRepository.find();
    },
  },
  Mutation: {
    register: async (
      _: never,
      {
        input,
      }: {
        input: Partial<Lead>;
      },
    ) => {
      await LeadRepository.create(input);
      return true;
    },
  },
};

export default leadResolvers;
