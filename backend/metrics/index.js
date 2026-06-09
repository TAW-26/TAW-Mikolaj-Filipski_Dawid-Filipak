const client = require('prom-client');

const register = new client.Registry();

// Domyślne metryki Node.js — CPU, RAM, event loop, GC
client.collectDefaultMetrics({ register });

// Licznik żądań HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Łączna liczba żądań HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Histogram czasu odpowiedzi (ms)
const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Czas trwania żądania w milisekundach',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});

// Gauge aktywnych połączeń
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Liczba aktualnie obsługiwanych połączeń',
  registers: [register],
});


module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationMs,
  activeConnections
};