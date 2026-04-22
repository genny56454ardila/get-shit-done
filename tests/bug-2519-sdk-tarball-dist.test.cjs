'use strict';

/**
 * Bug #2519: @gsd-build/sdk@0.1.0 tarball shipped without dist/.
 *
 * Root cause: `files` was missing from sdk/package.json at first publish,
 * so npm used .gitignore exclusions — which exclude dist/ — and the built
 * output was not included in the tarball. `prepublishOnly` ran and built
 * dist/, but it was then excluded.
 *
 * Fix: sdk/package.json must declare `files: ["dist", "prompts"]` AND
 * `prepublishOnly: "npm run build"` so every `npm publish` builds first
 * and explicitly includes dist/ in the tarball.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SDK_PKG = path.join(__dirname, '..', 'sdk', 'package.json');

describe('sdk/package.json publish hygiene (#2519)', () => {
  let pkg;

  test('sdk/package.json exists and is valid JSON', () => {
    assert.ok(fs.existsSync(SDK_PKG), 'sdk/package.json must exist');
    pkg = JSON.parse(fs.readFileSync(SDK_PKG, 'utf-8'));
  });

  test('files field includes "dist" (#2519)', () => {
    if (!pkg) pkg = JSON.parse(fs.readFileSync(SDK_PKG, 'utf-8'));
    assert.ok(Array.isArray(pkg.files), 'sdk/package.json must have a "files" array');
    assert.ok(
      pkg.files.includes('dist'),
      '"dist" must be in sdk/package.json files — without it, npm uses .gitignore ' +
      'which excludes dist/, and the tarball ships without the built output',
    );
  });

  test('files field includes "prompts" (#2519)', () => {
    if (!pkg) pkg = JSON.parse(fs.readFileSync(SDK_PKG, 'utf-8'));
    assert.ok(
      pkg.files.includes('prompts'),
      '"prompts" must be in sdk/package.json files',
    );
  });

  test('prepublishOnly script builds before pack (#2519)', () => {
    if (!pkg) pkg = JSON.parse(fs.readFileSync(SDK_PKG, 'utf-8'));
    assert.ok(pkg.scripts, 'sdk/package.json must have scripts');
    assert.ok(
      typeof pkg.scripts.prepublishOnly === 'string',
      'sdk/package.json must have a prepublishOnly script',
    );
    assert.ok(
      pkg.scripts.prepublishOnly.includes('build'),
      'prepublishOnly must invoke the build step so dist/ exists before packing',
    );
  });

  test('bin.gsd-sdk points into dist/ (#2519)', () => {
    if (!pkg) pkg = JSON.parse(fs.readFileSync(SDK_PKG, 'utf-8'));
    assert.ok(pkg.bin, 'sdk/package.json must have a bin field');
    const binTarget = pkg.bin['gsd-sdk'];
    assert.ok(
      typeof binTarget === 'string' && binTarget.startsWith('./dist/'),
      `bin.gsd-sdk must point into dist/ (got: ${binTarget}) — ` +
      'if dist/ is missing from the tarball, the bin will be unresolvable',
    );
  });
});
