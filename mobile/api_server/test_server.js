const app = require('./app.js');
const server = app.listen(55555, '127.0.0.1', () => console.log('Listening on 55555 IPv4'));
server.on('error', (e) => console.error('Error:', e));
setTimeout(() => console.log('Done'), 3000);
