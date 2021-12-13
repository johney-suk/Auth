const proxy = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        proxy({
            target: 'http://localhost:5000',
            changeOrigin: true,
        })
    );
};
// http-proxy-middleware 1.0.0 vserison↑ format
// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function(app) {
//   app.use(
//     '/api',
//     createProxyMiddleware({
//       target: 'http://localhost:5000',
//       changeOrigin: true,
//     })
//   );
// };