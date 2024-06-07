/**
 * MIT License
 *
 * Copyright (c) 2024 Yegor Bugayenko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
      assert(stdout.includes('errors found'), stdout);
      done();
    });
  });
});
