import { EmailAddressResolver, PhoneNumberResolver } from 'graphql-scalars';

export const scalarResolvers = {
  EmailAddress: EmailAddressResolver,
  PhoneNumber: PhoneNumberResolver,
};

export default scalarResolvers;
