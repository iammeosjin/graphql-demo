import { Lead, LeadService } from '../../src/repositories/lead';
import fixture from './fixture';

describe('Query: leads', () => {
  it('should return empty array when no leads exist', async () => {
    const { context, teardown } = await fixture();

    const query = `
      query {
        leads {
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
      expect(response.body.singleResult.data?.leads).toEqual([]);
    }

    await teardown();
  });

  it('should return all leads', async () => {
    const { context, teardown } = await fixture();

    const lead1: Partial<Lead> = {
      name: 'Alice Smith',
      email: 'alice@example.com',
      mobile: '+1234567891',
      postcode: '12346',
      service: LeadService.DELIVERY,
    };

    const lead2: Partial<Lead> = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      mobile: '+1234567892',
      postcode: '12347',
      service: LeadService.PICK_UP,
    };

    await context.repository.create(lead1);
    await context.repository.create(lead2);

    const query = `
      query {
        leads {
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
      const leads = response.body.singleResult.data?.leads as Lead[];
      expect(leads).toHaveLength(2);
      expect(leads[0].name).toBe('Alice Smith');
      expect(leads[1].name).toBe('Bob Johnson');
    }

    await teardown();
  });
});
