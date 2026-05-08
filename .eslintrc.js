module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
  ],
  rules: {
    'vue/multi-word-component-names': ['error', { ignores: ['index'] }],
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/extensions': 'off',
    'no-param-reassign': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
