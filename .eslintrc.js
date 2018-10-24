// module.exports = {
//   parser: 'babel-eslint',
//   extends: ['airbnb', 'prettier', 'plugin:compat/recommended'],
//   env: {
//     browser: true,
//     node: true,
//     es6: true,
//     mocha: true,
//     jest: true,
//     jasmine: true,
//   },
//   globals: {
//     APP_TYPE: true,
//   },
//   rules: {
//     'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
//     'react/jsx-wrap-multilines': 0,
//     'react/prop-types': 0,
//     'react/forbid-prop-types': 0,
//     'react/jsx-one-expression-per-line': 0,
//     'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
//     'import/no-extraneous-dependencies': [2, { optionalDependencies: true }],
//     'jsx-a11y/no-noninteractive-element-interactions': 0,
//     'jsx-a11y/click-events-have-key-events': 0,
//     'jsx-a11y/no-static-element-interactions': 0,
//     'jsx-a11y/anchor-is-valid': 0,
//     'linebreak-style': 0,
//   },
//   settings: {
//     polyfills: ['fetch', 'promises', 'url'],
//   },
// };

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    APP_TYPE: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: ['airbnb', 'prettier', 'eslint:recommended'],
  settings: {
    polyfills: ['fetch', 'promises', 'url'],
  },
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'space-before-function-paren': 0,
    indent: ['off', 4],
    'comma-dangle': ['off', 'only-multiline'],
    'no-console': 'off',

    'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
    'no-undef': ['off'],
    'no-mixed-spaces-and-tabs': ['warn'],

    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/react-in-jsx-scope': 'off',
    'react/jsx-indent': 4,
    'react/jsx-closing-tag-location': 'off',
    'react/destructuring-assignment': 'warn',
    'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
    'import/no-extraneous-dependencies': [2, { optionalDependencies: true }],
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'linebreak-style': 0,
  },
};
