const path = require('path');

module.exports = {
   extends: ['eslint:recommended', 'plugin:node/recommended'],
   env: {
      node: true
   },
   rules: {
      'node/exports-style': ['error', 'module.exports'],
      'no-plusplus': 'off',
      'class-methods-use-this': [0, { exceptMethods: ['getDataFromRpc'] }],
      'max-len': 0,
      'object-curly-newline': 0,
      'semi': 0,
      'linebreak-style': 0,
      allowThen: 'true',
      indent: 'off',
      'arrow-parens': [
         'off'
      ],
      'compat/compat': 'off',
      'consistent-return': 'off',
      'comma-dangle': 'off',
      'generator-star-spacing': 'off',
      'no-console': 'off',
      'no-use-before-define': 'off',
      'no-multi-assign': 'off',
      'node/no-missing-require': 'off',
      'import/no-unresolved': [2, { commonjs: true, amd: true }],
      'import/named': 2,
      'import/namespace': 2,
      'import/default': 2,
      'import/export': 2,
      'node/no-extraneous-require': ['error', {
         allowModules: ['~']
      }]
   },
   plugins: [
      'import'
   ],
   settings: {
      'import/resolver': {
         alias: [
            ['~', path.resolve(__dirname, './')]
         ]
      }
   }
}
