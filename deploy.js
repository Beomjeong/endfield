var ghpages = require('gh-pages');

ghpages.publish('.', {
  src: [
    'index.html',
    'style.css',
    'script.js',
    'assets/**/*'
  ],
  history: false,
  message: 'Deploy'
}, function (err) {
  if (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
  } else {
    console.log('Deploy complete!');
  }
});
