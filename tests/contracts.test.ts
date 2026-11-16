import { expect, it } from 'vitest';
import { experimental_scanPublicSdkOnly } from '@get-bb/plugin-sdk/testing';
import server from '../server';
it('uses public SDK imports and package-local source only', () => {
  const report = experimental_scanPublicSdkOnly(process.cwd(), { allow: [/^react$/, /^@testing-library\/react$/, /^vitest\//] });
  expect(report.violations).toEqual([]);
  expect(report.privateDependencies).toEqual([]);
});
it('needs no backend API capabilities', () => {
  const forbidden = new Proxy({}, { get() { throw new Error('Backend capabilities must stay unused'); } });
  expect(() => server(forbidden as Parameters<typeof server>[0])).not.toThrow();
});
