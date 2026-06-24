import { describe, it, expect } from 'vite-plus/test';
import packageJson from '../../package.json';

describe('package.json metadata', () => {
  it('has required repository field with git type and GitHub URL', () => {
    expect(packageJson.repository).toBeDefined();
    expect(packageJson.repository.type).toBe('git');
    expect(packageJson.repository.url).toMatch(/^https:\/\/github\.com\/.+\.git$/);
  });

  it('has a valid SPDX license', () => {
    expect(packageJson.license).toMatch(/^[A-Z0-9\-.]+$/i);
  });

  it('has publishConfig with public access', () => {
    expect(packageJson.publishConfig).toEqual({ access: 'public' });
  });

  it('has homepage as a valid HTTPS URL', () => {
    expect(packageJson.homepage).toMatch(/^https:\/\//);
  });

  it('has at least 3 non-empty keywords', () => {
    expect(packageJson.keywords.length).toBeGreaterThanOrEqual(3);
    packageJson.keywords.forEach((keyword: string) => expect(keyword.trim()).not.toBe(''));
  });

  it('has non-empty description', () => {
    expect(packageJson.description.trim().length).toBeGreaterThan(0);
  });
});
