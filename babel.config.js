const BABEL_ENV = process.env.BABEL_ENV;
const building = BABEL_ENV != null && BABEL_ENV !== 'cjs';
const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-nullish-coalescing-operator',
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-proposal-optional-chaining',
  'dev-expression',
  [
    '@babel/plugin-transform-runtime',
    {
      regenerator: true,
    },
  ],
  [
    'transform-react-remove-prop-types',
    {
      mode: 'unsafe-wrap',
    },
  ],
  [
    'transform-inline-environment-variables',
    {
      include: ['COMPAT'],
    },
  ],
];

const presets = [
  [
    '@babel/preset-env',
    {
      loose: true,
      modules: building ? false : 'commonjs',
    },
  ],
  '@babel/preset-react',
];

module.exports = function(api) {
  api.cache(() => process.env.NODE_ENV);
  return {
    presets,
    plugins,
  };
};
