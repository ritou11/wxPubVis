const _ = require('lodash');
const express = require('express');
const cors = require('cors');
const nocache = require('nocache');
const bodyParser = require('body-parser');
const { graphqlExpress } = require('apollo-server-express');
const { schema } = require('./graphql');
const { expressTh } = require('./throttle');
const logger = require('../logger')('index');

const router = express.Router();

router.use(cors({
  origin: [
    process.env.CORS_ORIGIN,
    /^https?:\/\/localhost(:\d+)?$/,
  ],
  methods: ['HEAD', 'GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 300000,
}));

router.get('/', (req, res) => {
  logger.trace('GET /');
  res.status(200).send("ok");
});

router.use(
  '/graphql',
  expressTh('graphql', { max: 10, duration: 5000 }, (req) => req.ip),
  nocache(),
  bodyParser.json(),
  bodyParser.text({
    type: 'application/graphql',
  }),
  (req, res, next) => {
    logger.info(`${req.method} /graphql`);
    if (req.is('application/graphql')) {
      req.body = { query: req.body };
    }
    next();
  },
  graphqlExpress({
    schema,
    tracing: process.env.NODE_ENV !== 'production',
    formatError: (err) => {
      const e = {
        message: err.message,
        statusCode: _.get(err, 'originalError.statusCode'),
        errorCode: _.get(err, 'originalError.errorCode'),
      };
      logger.trace('Return err', e);
      return e;
    },
  }),
);

module.exports = router;
