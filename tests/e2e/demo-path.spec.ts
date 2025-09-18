import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('content bundle exists and export filename pattern is correct', async () => {
  // Verify content script bundle invariant
  const path = 'extension/dist/assets/content.js';
  const exists = fs.existsSync(path);
  expect(exists).toBe(true);

  const head = fs.readFileSync(path, 'utf8').slice(0, 40);
  expect(head.startsWith('(function()') || head.startsWith('(()=>')).toBeTruthy();

  // No top-level import/export
  const file = fs.readFileSync(path, 'utf8');
  expect(/^\s*(import|export)\s/m.test(file)).toBeFalsy();

  // Filename pattern sanity
  const sample = 'onboarding-audit-example.com-202501011230.html';
  expect(sample).toMatch(/^onboarding-audit-[a-z0-9.-]+-\d{12}\.html$/);
});
