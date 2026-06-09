// Importujemy metryki z sąsiedniego pliku index.js
const { 
  activeConnections, 
  httpRequestsTotal, 
  httpRequestDurationMs 
} = require('./index');

function metricsMiddleware(req, res, next) {
  const startMs = Date.now();
  activeConnections.inc();

  res.on('finish', () => {
    const durationMs = Date.now() - startMs;
    const route = req.route?.path ?? req.path;  // wzorzec, nie konkretna wartość
    const labels = { method: req.method, route, status_code: String(res.statusCode) };

    httpRequestsTotal.inc(labels);
    httpRequestDurationMs.observe(labels, durationMs);
    activeConnections.dec();
  });

  next();
}

module.exports = metricsMiddleware;