module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Enforce consistent code style
    'indent': ['error', 2],
    'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'brace-style': ['error', '1tbs'],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always',
    }],
    'space-infix-ops': 'error',
    'max-len': ['warn', { 'code': 100, 'ignoreComments': true, 'ignoreStrings': true }],
    
    // TypeScript specific rules
    '@typescript-eslint/explicit-function-return-type': ['error', {
      'allowExpressions': true,
      'allowTypedFunctionExpressions': true,
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // Error handling
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-throw-literal': 'error',
    
    // Best practices
    'no-unused-vars': 'off', // Using TypeScript's version instead
    '@typescript-eslint/no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
    }],
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
  },
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  ignorePatterns: ['dist', 'node_modules'],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: [
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            'selector': 'interface',
            'format': ['PascalCase'],
            'prefix': ['I'],
          },
          {
            'selector': 'class',
            'format': ['PascalCase'],
          },
          {
            'selector': 'typeAlias',
            'format': ['PascalCase'],
          },
          {
            'selector': 'enum',
            'format': ['PascalCase'],
          },
          {
            'selector': 'variable',
            'format': ['camelCase', 'UPPER_CASE'],
            'leadingUnderscore': 'allow',
          },
          {
            'selector': 'function',
            'format': ['camelCase'],
          },
          {
            'selector': 'method',
            'format': ['camelCase'],
            'leadingUnderscore': 'allow',
          },
          {
            'selector': 'parameter',
            'format': ['camelCase'],
            'leadingUnderscore': 'allow',
          },
          {
            'selector': 'property',
            'format': ['camelCase', 'UPPER_CASE'],
            'leadingUnderscore': 'allow',
          },
        ],
      },
    },
  ],
};
