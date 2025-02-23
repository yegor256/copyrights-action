/**
 * MIT License
 *
 * SPDX-FileCopyrightText: Copyright (c) 2024 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const os = require('os');
const path = require('path');
const assert = require('assert');
const spawnSync = require('child_process').spawnSync;
const fs = require('fs');

function runSync(env) {
  const ret = spawnSync(
    'node', [path.resolve('./src/copyrights.js')],
    {
      encoding : 'utf8',
      env: Object.assign({}, process.env, env)
    }
  );
  return ret.stdout;
}

describe('copyrights', function() {
  it('finds no errors', function(done) {
    const stdout = runSync({});
    assert(stdout.includes('Errors not found'), stdout);
    done();
  });

  it('finds errors', function(done) {
    fs.mkdtemp(path.join(os.tmpdir(), 'copyrights-'), (err, folder) => {
      if (err) throw err;
      fs.writeFileSync(path.resolve(folder, 'LICENSE.txt'), 'Copyright 2024');
      fs.writeFileSync(path.resolve(folder, '.hello.js'), 'no copyright');
      const stdout = runSync({'GITHUB_WORKSPACE': folder});
      assert(stdout.includes('Errors: '), stdout);
      done();
    });
  });
});
