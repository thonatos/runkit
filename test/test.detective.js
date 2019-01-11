const fs = require('fs');
const path = require('path');
const assert = require('assert');
const detective = require('../lib/detective');

const code = fs.readFileSync(path.join(__dirname, './test.example.js'), 'utf-8');

describe('node-detective', () => {
  it('should get all deps', () => {
    const deps = detective(code);
    assert.deepEqual(deps, ['a', 'b', 'c', 'd', 'e', 'f']);
  });
});