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

'use strict';

const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const home = path.resolve(process.env['GITHUB_WORKSPACE'] || '.');
console.log(`The directory to scan: "${home}"`);
const license = path.resolve(home, core.getInput('license') || 'LICENSE.txt');
console.log(`The license file: "${license}"`);
const globs = (core.getInput('globs') || '**/*.js').split(/ +/);
console.log(`Globs to use: [${globs.join(', ')}]`);
const ignore = (core.getInput('ignore') || 'node_modules/**').split(/ +/);
console.log(`Globs to ignore: [${ignore.join(', ')}]`);

const match = Array.from(
  (fs.readFileSync(license, 'utf8') + "\n").matchAll(/(Copyright .+)\n/g)
)[0];
if (match == undefined) {
  throw `Can't find "Copyright" line in ${license}`
}
const punch = match[1];
if (punch == undefined) {
  throw `Can't find "Copyright" line in ${license}`
}
console.log(`Punch line is: "${punch}"`);

var scope = [];
for (const g of globs) {
  glob.sync(g, { cwd: home, dot: true }).forEach((f) => {
    scope.push(f);
  });
}
for (const g of ignore) {
  glob.sync(g, { cwd: home, dot: true }).forEach((f) => {
    scope = scope.filter((i) => {
      if (i == f) {
        return false;
      }
      return true;
    });
  });
}

const errors = [];
for (const f of scope) {
  if (fs.readFileSync(path.resolve(home, f), 'utf8').includes(punch)) {
    console.log(`OK: ${f}`);
  } else {
    console.log(`Missed: ${f}`);
    errors.push(f);
  }
}

if (errors != 0) {
  console.log(`Total: ${scope.length}\nErrors: ${errors.length}\nIn files:\n${errors.join('\n')}`);
  process.exit(1);
}

console.log(`Errors not found in ${scope.length} files`);
