/**
 * SPDX-FileCopyrightText: Copyright (c) 2024-2025 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const os = require('os');
const path = require('path');
const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');

runSync = (env) => {
  const ret = spawnSync(
    'node', [path.resolve('./src/copyrights.js')],
    {
      encoding : 'utf8',
      env: { ...process.env, ...env }
    }
  );
  return ret.stdout;
}

describe('copyrights', () => {
  it('finds no errors', (done) => {
    const stdout = runSync({});
    assert(stdout.includes('Errors not found'), stdout);
    done();
  });

  it('finds errors', (done) => {
    fs.mkdtemp(path.join(os.tmpdir(), 'copyrights-'), (err, folder) => {
      if (err) {
        throw err;
      }
      fs.writeFileSync(path.resolve(folder, 'LICENSE.txt'), 'Copyright 2024-2025');
      fs.writeFileSync(path.resolve(folder, '.hello.js'), 'no copyright');
      const stdout = runSync({'GITHUB_WORKSPACE': folder});
      assert(stdout.includes('Errors: '), stdout);
      done();
    });
  });

  it('ignores directories', (done) => {
    fs.mkdtemp(path.join(os.tmpdir(), 'copyrights-'), (err, folder) => {
      if (err) {
        throw err;
      }
      fs.writeFileSync(path.resolve(folder, 'LICENSE.txt'), 'Copyright 2024-2025');
      fs.mkdirSync(path.resolve(folder, 'subdir'));
      fs.writeFileSync(path.resolve(folder, 'file.js'), 'Copyright 2024-2025');
      const stdout = runSync({'GITHUB_WORKSPACE': folder, 'INPUT_GLOBS': '**'});
      assert(stdout.includes('Errors not found'), stdout);
      assert(stdout.includes('OK: file.js'), stdout);
      assert(!stdout.includes('subdir'), stdout);
      done();
    });
  });
});
