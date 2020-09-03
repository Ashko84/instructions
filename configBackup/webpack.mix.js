const mix = require('webpack-mix');

mix
  .options({
    terser: {
      extractComments: false
    }
  })
  .js('codeLand/vueInit.js', 'kmag.net/sharedcakephp/codeland/js')
  .js(
    'codeLand/kia/js/representatives.js',
    'kmag.net/sharedcakephp/codeland/kia/js'
  );
