const Walker = require('node-source-walk');
const debug = require('debug')('Detective');

module.exports = src => {
  const walker = new Walker();

  const dependencies = [];

  if (typeof src === 'undefined') {
    throw new Error('src not given');
  }

  if (src === '') {
    return dependencies;
  }

  walker.walk(src, function(node) {
    switch (node.type) {
      case 'ImportDeclaration':
        debug('ImportDeclaration');
        if (node.source && node.source.value) {
          dependencies.push(node.source.value);
        }
        break;

      case 'ExportNamedDeclaration':

      case 'ExportAllDeclaration':
        debug(node.name, node.type);
        if (node.source && node.source.value) {
          dependencies.push(node.source.value);
        }
        break;

      case 'CallExpression':
        debug('CallExpression', node.callee.name, node.callee.type);
        if (node.callee.type === 'Import' && node.arguments.length) {
          dependencies.push(node.arguments[0].value);
        }
        if (node.callee.name === 'require' && node.arguments.length) {
          node.arguments.map(({ type, value }) => {
            if (type === 'StringLiteral') {
              dependencies.push(value);
            }
          });
        }

      default:
        return;
    }
  });

  return dependencies;
};