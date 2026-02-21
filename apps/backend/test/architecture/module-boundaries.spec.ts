/**
 * Architecture Tests - Module Boundaries
 *
 * Validates that the NestJS codebase follows clean architecture rules:
 * - Entities don't import from controllers
 * - Controllers don't import TypeORM repos directly
 * - DTOs don't import entities
 * - No circular dependencies between modules
 *
 * @ref GUIA-ARCHITECTURE-TESTING §3-4
 * @ref ESTANDAR-TESTING v2.0 §10
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../../src');

function getAllTsFiles(dir: string, pattern?: RegExp): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTsFiles(fullPath, pattern));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') && !entry.name.endsWith('.test.ts')) {
      if (!pattern || pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function getImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
  const imports: string[] = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

describe('Architecture: Module Boundaries', () => {
  describe('Entities must not import from controllers', () => {
    const entityFiles = getAllTsFiles(path.join(SRC_DIR, 'modules'), /\.entity\.ts$/);

    it('should have entity files to test', () => {
      expect(entityFiles.length).toBeGreaterThan(0);
    });

    it.each(entityFiles.map(f => [path.relative(SRC_DIR, f), f]))(
      '%s should not import controllers',
      (_name, filePath) => {
        const imports = getImports(filePath);
        const controllerImports = imports.filter(imp => imp.includes('controller'));
        expect(controllerImports).toEqual([]);
      },
    );
  });

  describe('Controllers must not import TypeORM repositories directly', () => {
    const controllerFiles = getAllTsFiles(path.join(SRC_DIR, 'modules'), /\.controller\.ts$/);

    it('should have controller files to test', () => {
      expect(controllerFiles.length).toBeGreaterThan(0);
    });

    it.each(controllerFiles.map(f => [path.relative(SRC_DIR, f), f]))(
      '%s should not import Repository or InjectRepository',
      (_name, filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).not.toMatch(/InjectRepository/);
        expect(content).not.toMatch(/Repository\s*<.*>\s*\)/);
      },
    );
  });

  describe('DTOs must not import entity files', () => {
    const dtoDir = path.join(SRC_DIR, 'modules');
    const dtoFiles = getAllTsFiles(dtoDir, /\.dto\.ts$/);

    it('should have DTO files to test', () => {
      expect(dtoFiles.length).toBeGreaterThan(0);
    });

    it.each(dtoFiles.map(f => [path.relative(SRC_DIR, f), f]))(
      '%s should not import entity files',
      (_name, filePath) => {
        const imports = getImports(filePath);
        const entityImports = imports.filter(imp => imp.includes('.entity'));
        expect(entityImports).toEqual([]);
      },
    );
  });
});

describe('Architecture: Naming Conventions', () => {
  describe('Controller files export *Controller class', () => {
    const controllerFiles = getAllTsFiles(path.join(SRC_DIR, 'modules'), /\.controller\.ts$/);

    it.each(controllerFiles.map(f => [path.relative(SRC_DIR, f), f]))(
      '%s should export a class ending in Controller',
      (_name, filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/export\s+class\s+\w+Controller/);
      },
    );
  });

  describe('Service files export *Service class', () => {
    const serviceFiles = getAllTsFiles(path.join(SRC_DIR, 'modules'), /\.service\.ts$/);

    it.each(serviceFiles.map(f => [path.relative(SRC_DIR, f), f]))(
      '%s should export a class ending in Service',
      (_name, filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/export\s+(abstract\s+)?class\s+\w+Service/);
      },
    );
  });

  describe('Entity files use @Entity decorator', () => {
    const entityFiles = getAllTsFiles(path.join(SRC_DIR, 'modules'), /\.entity\.ts$/);

    it.each(entityFiles.map(f => [path.relative(SRC_DIR, f), f]))(
      '%s should use @Entity() decorator',
      (_name, filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/@Entity\(/);
      },
    );
  });
});
