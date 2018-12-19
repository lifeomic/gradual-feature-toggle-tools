const stringHash = require('string-hash');
const { sha256 } = require('crypto-hash');

export async function calculateUserEnablementThreshold (feature: string, user: string) {
  const hash = await sha256(`${feature}-${user}`);
  return (stringHash(hash) % 100) + 1;
}
