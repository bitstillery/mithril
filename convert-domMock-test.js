const fs = require('fs');
const content = fs.readFileSync('test-utils/tests/test-domMock.js', 'utf8');

// Start with imports
let converted = `import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { spy } from "../test-helpers.js"
import domMock from "../../test-utils/domMock.js"

`;

// Remove "use strict" and require statements
let rest = content
  .replace(/^"use strict"\s*\n/, '')
  .replace(/^var o = require\("ospec"\)\s*\n/, '')
  .replace(/^var domMock = require\("\.\.\/\.\.\/test-utils\/domMock"\)\s*\n/, '');

// Convert o.spec to describe
rest = rest.replace(/o\.spec\(/g, 'describe(');

// Convert o.beforeEach/afterEach
rest = rest.replace(/o\.beforeEach\(/g, 'beforeEach(');
rest = rest.replace(/o\.afterEach\(/g, 'afterEach(');

// Convert o("test name", function() { to test("test name", () => {
rest = rest.replace(/o\("([^"]+)",\s*function\(\)\s*\{/g, 'test("$1", () => {');
rest = rest.replace(/o\("([^"]+)",\s*function\(done\)\s*\{/g, 'test("$1", (done) => {');
rest = rest.replace(/o\("([^"]+)"\)\s*\{/g, 'test("$1", () => {');

// Convert o(...).equals(...) to expect(...).toBe(...)
rest = rest.replace(/o\(([^)]+)\)\.equals\(([^)]+)\)/g, (match, p1, p2) => {
  // Handle nested parentheses carefully
  return `expect(${p1}).toBe(${p2})`;
});

// Convert o(...).deepEquals(...) to expect(...).toEqual(...)
rest = rest.replace(/o\(([^)]+)\)\.deepEquals\(([^)]+)\)/g, (match, p1, p2) => {
  return `expect(${p1}).toEqual(${p2})`;
});

// Convert o(...).notEquals(...) to expect(...).not.toBe(...)
rest = rest.replace(/o\(([^)]+)\)\.notEquals\(([^)]+)\)/g, (match, p1, p2) => {
  return `expect(${p1}).not.toBe(${p2})`;
});

// Convert o.spy() to spy()
rest = rest.replace(/o\.spy\(\)/g, 'spy()');
rest = rest.replace(/o\.spy\(([^)]+)\)/g, 'spy($1)');

// Convert var declarations to let with types
rest = rest.replace(/var (\$document, \$window)/g, 'let $1: any');
rest = rest.replace(/var (\$window)/g, 'let $1: any');
rest = rest.replace(/var (\$DOMParser)/g, 'let $1: any');
rest = rest.replace(/var (spy|div|e|parent|child|a|b|c|source|ref|target|other|capture|bubble|handler|capParent|capTarget|bubTarget|legacyTarget|bubParent|legacyParent|sequence|errMsg|input|textarea|select|option|option1|option2|option3|option4|optgroup|canvas|el|spies|parser|doc|nodes|node|old|threw|errMsg)/g, 'let $1');

// Convert function() to () =>
rest = rest.replace(/function\(\)\s*\{/g, '() => {');
rest = rest.replace(/function\(done\)\s*\{/g, '(done) => {');
rest = rest.replace(/function\(ev\)\s*\{/g, '(ev: any) => {');
rest = rest.replace(/function\(e\)\s*\{/g, '(e: any) => {');

// Handle special cases for spy properties
rest = rest.replace(/(\w+)\.callCount/g, '($1 as ReturnType<typeof spy>).callCount');
rest = rest.replace(/(\w+)\.this/g, '($1 as ReturnType<typeof spy>).this');
rest = rest.replace(/(\w+)\.args/g, '($1 as ReturnType<typeof spy>).args');

// Handle domMock({spy: o.spy})
rest = rest.replace(/domMock\(\{spy:\s*o\.spy\}\)/g, 'domMock({spy: spy})');

// Handle window event handlers
rest = rest.replace(/(\$window\.on\w+)\s*=\s*o\.spy\(\)/g, '$1 = spy()');
rest = rest.replace(/(\$window\.on\w+)\s*=\s*spy\(\)/g, '$1 = spy()');

// Handle instanceof checks - convert o(...).instanceof(...) to expect(...).toBeInstanceOf(...)
rest = rest.replace(/o\(([^)]+)\)\.instanceof\(([^)]+)\)/g, 'expect($1).toBeInstanceOf($2)');

// Handle typeof checks - keep as is but ensure proper formatting
// These are already fine

// Handle "in" operator checks - keep as is
// These are already fine

converted += rest;

fs.writeFileSync('test-utils/tests/test-domMock.test.ts', converted);
console.log('Converted test-domMock.js to test-domMock.test.ts');
