import { Lead, LeadService } from '../../src/repositories/lead';
import fixture from './fixture';

describe('Query: lead', () => {
  it('should return null when lead does not exist', async () => {
    const { context, teardown } = await fixture();

    const query = `
      query {
        lead(id: "999") {
          id
          name
          email
        }
      }
    `;

    const response = await context.server.executeOperation({ query });
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.data?.lead).toBeNull();
    }

    await teardown();
  });

  it('should return a lead by id', async () => {
    const { context, teardown } = await fixture();

    const leadData: Partial<Lead> = {
      name: 'John Doe',
      email: 'john@example.com',
      mobile: '+1234567890',
      postcode: '12345',
      service: LeadService.DELIVERY,
    };

    await context.repository.create(leadData);
    const leads = await context.repository.find();
    const createdLead = leads[0];

    const query = `
      query {
        lead(id: "${createdLead.id}") {
          id
          name
          email
          mobile
          postcode
          service
        }
      }
    `;

    const response = await context.server.executeOperation({ query });
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      const lead = response.body.singleResult.data?.lead as Lead;
      expect(lead).not.toBeNull();
      expect(lead.name).toBe('John Doe');
      expect(lead.email).toBe('john@example.com');
    }
    await teardown();
  });
});
