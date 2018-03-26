module.exports = {
  plugins: {
    'posthtml-expressions': {
      root: __dirname,
      locals: {
        NODE_ENV: process.env.NODE_ENV
      }
    },
    'posthtml-include': {
      root: __dirname
    },
    'posthtml-md': {
      root: __dirname
    }
  }
};
