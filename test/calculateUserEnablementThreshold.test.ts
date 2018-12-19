import { times, constant } from 'lodash';
import { generate } from 'randomstring';
import { calculateUserEnablementThreshold } from '../src';

import chiSquaredTest = require('chi-squared-test');

const TIMEOUT = 30000;

async function assertUniformDistribution (generateUserName: () => string) {
  const thresholdBuckets = 100;
  const expectedFrequencies = times(thresholdBuckets, constant(0));
  const observedFrequencies = times(thresholdBuckets, constant(0));

  // Keep adding more and more test data until the test times out or
  // a sufficient level of confidence is reached.
  const start = Date.now();
  while (Date.now() - start < TIMEOUT) {
    const usersPerBucket = 100; // Test with 100 users per bucket to have confidence in the distribution
    const usersToTest = thresholdBuckets * usersPerBucket;

    const enablementThresholdForUser = (user: string) => calculateUserEnablementThreshold('feature', user);
    const users = times(usersToTest, generateUserName);

    expectedFrequencies.forEach((value, index) => {
      expectedFrequencies[index] = value + usersPerBucket;
    });

    const observedThresholds = await Promise.all(users.map(enablementThresholdForUser));
    observedThresholds.forEach(threshold => {
      // Assert that the enablement thresholds are at least one and as high as 100
      expect(threshold).toBeGreaterThan(0);
      expect(threshold).toBeLessThanOrEqual(100);

      observedFrequencies[threshold - 1]++;
    });

    const pValue = chiSquaredTest(observedFrequencies, expectedFrequencies, 1).probability;
    if (pValue > 0.05) {
      // Sufficient confidence has been reached
      return;
    }
  }

  fail(`Sufficient confidence could not be reached within ${TIMEOUT} ms`);
}

test('users will be enabled with a uniform distribution for a feature', async () => {
  await assertUniformDistribution(() => generate(7));
});

test('users that share a common prefix will be enabled with a uniform distribution for a feature', async () => {
  await assertUniformDistribution(() => `LifeOmic_Facebook_${generate(16)}`);
});

test('a user will always be enabled at the same threshold for a given feature', async () => {
  const user = generate();
  const firstThreshold = await calculateUserEnablementThreshold('feature', user);
  const secondThreshold = await calculateUserEnablementThreshold('feature', user);

  expect(firstThreshold).toEqual(secondThreshold);
});

test('a user will be enabled at different thresholds for different features', async () => {
  const user = generate();
  const firstThreshold = await calculateUserEnablementThreshold('feature', user);
  const secondThreshold = await calculateUserEnablementThreshold('feature-2', user);

  expect(firstThreshold).not.toEqual(secondThreshold);
});
