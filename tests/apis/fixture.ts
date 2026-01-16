import {
  cleanupTestContext,
  setupTestContext,
  TestContext,
} from '../helpers/test-setup';

export default async function fixture() {
  const context: TestContext = await setupTestContext();
  await context.pool.query('DELETE FROM leads');

  return {
    context,
    async teardown() {
      await cleanupTestContext(context);
    },
  };
}
