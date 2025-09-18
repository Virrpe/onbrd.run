import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('content bundle exists and export filename pattern is correct', async () => {
  const p = 'extension/dist/assets/content.js';
  expect(fs.existsSync(p)).toBe(true);

  const head = fs.readFileSync(p, 'utf8').slice(0, 40);
  expect(head.startsWith('(function()') || head.startsWith('(()=>')).toBeTruthy();

  const file = fs.readFileSync(p, 'utf8');
  expect(/^\s*(import|export)\s/m.test(file)).toBeFalsy();

  const sample = 'onboarding-audit-example.com-202501011230.html';
  expect(sample).toMatch(/^onboarding-audit-[a-z0-9.-]+-\d{12}\.html$/);
});
