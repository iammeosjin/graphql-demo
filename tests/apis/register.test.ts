import { faker } from '@faker-js/faker';
import { LeadService } from '../../src/repositories/lead';
import fixture from './fixture';

describe('Mutation: register', () => {
  it('should create a new lead', async () => {
    const { context, teardown } = await fixture();

    const phoneNumber = `+639${faker.string.numeric(10)}`;

    const input = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      mobile: phoneNumber,
      postcode: faker.location.zipCode(),
      service: faker.helpers.arrayElement(Object.values(LeadService)),
    };
    const mutation = `
      mutation {
        register(input: {
          name: "${input.name}"
          email: "${input.email}"
          mobile: "${input.mobile}"
          postcode: "${input.postcode}"
          service: ${input.service}
        })
      }
    `;

    const response = await context.server.executeOperation({ query: mutation });
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data?.register).toBe(true);
    }

    const leads = await context.repository.find();
    expect(leads.length).toBe(1);
    expect(leads[0].name).toBe(input.name);
    expect(leads[0].email).toBe(input.email);
    expect(leads[0].mobile).toBe(input.mobile);
    expect(leads[0].postcode).toBe(input.postcode);
    expect(leads[0].service).toBe(input.service);

    await teardown();
  });

  it('should validate email format', async () => {
    const { context, teardown } = await fixture();
    const mutation = `
      mutation {
        register(input: {
          name: "John Doe"
          email: "invalid-email"
          mobile: "+1234567890"
          postcode: "12345"
          service: DELIVERY
        })
      }
    `;

    const response = await context.server.executeOperation({ query: mutation });
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeDefined();
      expect(
        response.body.singleResult.errors?.[0].message.toLowerCase(),
      ).toContain('email');
    }
    await teardown();
  });

  it('should validate phone number format', async () => {
    const { context, teardown } = await fixture();
    const mutation = `
      mutation {
        register(input: {
          name: "John Doe"
          email: "john@example.com"
          mobile: "invalid-phone"
          postcode: "12345"
          service: DELIVERY
        })
      }
    `;

    const response = await context.server.executeOperation({ query: mutation });
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeDefined();
      expect(
        response.body.singleResult.errors?.[0].message.toLowerCase(),
      ).toContain('phone');
    }

    await teardown();
  });
});
