'use strict';

var path = require('path');
var parseArgs = require('minimist');
var cliCommon = require('@backstage/cli-common');
var configLoader = require('@backstage/config-loader');
var config = require('@backstage/config');
var getPackages = require('@manypkg/get-packages');
var http = require('http');
var https = require('https');
var stoppableServer = require('stoppable');
var fs = require('fs-extra');
var forge = require('node-forge');
var cors = require('cors');
var helmet = require('helmet');
var morgan = require('morgan');
var compression = require('compression');
var minimatch = require('minimatch');
var errors = require('@backstage/errors');
var crypto = require('crypto');
var winston = require('winston');
var backendPluginApi = require('@backstage/backend-plugin-api');
var alpha = require('@backstage/backend-plugin-api/alpha');
var jose = require('jose');
var backendCommon = require('@backstage/backend-common');
var backendAppApi = require('@backstage/backend-app-api');
var cookie = require('cookie');
var PromiseRouter = require('express-promise-router');
var types = require('@backstage/types');
var pathToRegexp = require('path-to-regexp');
var pluginAuthNode = require('@backstage/plugin-auth-node');
var pluginPermissionNode = require('@backstage/plugin-permission-node');
var express = require('express');
var trimEnd = require('lodash/trimEnd');
var backendTasks = require('@backstage/backend-tasks');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

function _interopNamespaceCompat(e) {
  if (e && typeof e === 'object' && 'default' in e) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var parseArgs__default = /*#__PURE__*/_interopDefaultCompat(parseArgs);
var http__namespace = /*#__PURE__*/_interopNamespaceCompat(http);
var https__namespace = /*#__PURE__*/_interopNamespaceCompat(https);
var stoppableServer__default = /*#__PURE__*/_interopDefaultCompat(stoppableServer);
var fs__default = /*#__PURE__*/_interopDefaultCompat(fs);
var forge__default = /*#__PURE__*/_interopDefaultCompat(forge);
var cors__default = /*#__PURE__*/_interopDefaultCompat(cors);
var helmet__default = /*#__PURE__*/_interopDefaultCompat(helmet);
var morgan__default = /*#__PURE__*/_interopDefaultCompat(morgan);
var compression__default = /*#__PURE__*/_interopDefaultCompat(compression);
var PromiseRouter__default = /*#__PURE__*/_interopDefaultCompat(PromiseRouter);
var express__default = /*#__PURE__*/_interopDefaultCompat(express);
var trimEnd__default = /*#__PURE__*/_interopDefaultCompat(trimEnd);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ObservableConfigProxy {
  constructor(parent, parentKey) {
    this.parent = parent;
    this.parentKey = parentKey;
    __publicField(this, "config", new config.ConfigReader({}));
    __publicField(this, "subscribers", []);
    if (parent && !parentKey) {
      throw new Error("parentKey is required if parent is set");
    }
  }
  setConfig(config) {
    if (this.parent) {
      throw new Error("immutable");
    }
    this.config = config;
    for (const subscriber of this.subscribers) {
      try {
        subscriber();
      } catch (error) {
        console.error(`Config subscriber threw error, ${error}`);
      }
    }
  }
  subscribe(onChange) {
    if (this.parent) {
      return this.parent.subscribe(onChange);
    }
    this.subscribers.push(onChange);
    return {
      unsubscribe: () => {
        const index = this.subscribers.indexOf(onChange);
        if (index >= 0) {
          this.subscribers.splice(index, 1);
        }
      }
    };
  }
  select(required) {
    var _a;
    if (this.parent && this.parentKey) {
      if (required) {
        return this.parent.select(true).getConfig(this.parentKey);
      }
      return (_a = this.parent.select(false)) == null ? void 0 : _a.getOptionalConfig(this.parentKey);
    }
    return this.config;
  }
  has(key) {
    var _a, _b;
    return (_b = (_a = this.select(false)) == null ? void 0 : _a.has(key)) != null ? _b : false;
  }
  keys() {
    var _a, _b;
    return (_b = (_a = this.select(false)) == null ? void 0 : _a.keys()) != null ? _b : [];
  }
  get(key) {
    return this.select(true).get(key);
  }
  getOptional(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptional(key);
  }
  getConfig(key) {
    return new ObservableConfigProxy(this, key);
  }
  getOptionalConfig(key) {
    var _a;
    if ((_a = this.select(false)) == null ? void 0 : _a.has(key)) {
      return new ObservableConfigProxy(this, key);
    }
    return void 0;
  }
  getConfigArray(key) {
    return this.select(true).getConfigArray(key);
  }
  getOptionalConfigArray(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalConfigArray(key);
  }
  getNumber(key) {
    return this.select(true).getNumber(key);
  }
  getOptionalNumber(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalNumber(key);
  }
  getBoolean(key) {
    return this.select(true).getBoolean(key);
  }
  getOptionalBoolean(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalBoolean(key);
  }
  getString(key) {
    return this.select(true).getString(key);
  }
  getOptionalString(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalString(key);
  }
  getStringArray(key) {
    return this.select(true).getStringArray(key);
  }
  getOptionalStringArray(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalStringArray(key);
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function createConfigSecretEnumerator(options) {
  var _a;
  const { logger, dir = process.cwd() } = options;
  const { packages } = await getPackages.getPackages(dir);
  const schema = (_a = options.schema) != null ? _a : await configLoader.loadConfigSchema({
    dependencies: packages.map((p) => p.packageJson.name)
  });
  return (config) => {
    var _a2;
    const [secretsData] = schema.process(
      [{ data: (_a2 = config.getOptional()) != null ? _a2 : {}, context: "schema-enumerator" }],
      {
        visibility: ["secret"],
        ignoreSchemaErrors: true
      }
    );
    const secrets = /* @__PURE__ */ new Set();
    JSON.parse(
      JSON.stringify(secretsData.data),
      (_, v) => typeof v === "string" && secrets.add(v)
    );
    logger.info(
      `Found ${secrets.size} new secrets in config that will be redacted`
    );
    return secrets;
  };
}
async function loadBackendConfig(options) {
  var _a, _b;
  const args = parseArgs__default.default(options.argv);
  const configTargets = [(_a = args.config) != null ? _a : []].flat().map((arg) => isValidUrl(arg) ? { url: arg } : { path: path.resolve(arg) });
  const paths = cliCommon.findPaths(__dirname);
  let currentCancelFunc = void 0;
  const config$1 = new ObservableConfigProxy();
  const { appConfigs } = await configLoader.loadConfig({
    configRoot: paths.targetRoot,
    configTargets,
    remote: options.remote,
    watch: ((_b = options.watch) != null ? _b : true) ? {
      onChange(newConfigs) {
        console.info(
          `Reloaded config from ${newConfigs.map((c) => c.context).join(", ")}`
        );
        const configsToMerge = [...newConfigs];
        if (options.additionalConfigs) {
          configsToMerge.push(...options.additionalConfigs);
        }
        config$1.setConfig(config.ConfigReader.fromConfigs(configsToMerge));
      },
      stopSignal: new Promise((resolve) => {
        if (currentCancelFunc) {
          currentCancelFunc();
        }
        currentCancelFunc = resolve;
        if (module.hot) {
          module.hot.addDisposeHandler(resolve);
        }
      })
    } : void 0
  });
  console.info(
    `Loaded config from ${appConfigs.map((c) => c.context).join(", ")}`
  );
  const finalAppConfigs = [...appConfigs];
  if (options.additionalConfigs) {
    finalAppConfigs.push(...options.additionalConfigs);
  }
  config$1.setConfig(config.ConfigReader.fromConfigs(finalAppConfigs));
  return { config: config$1 };
}

const DEFAULT_PORT = 7007;
const DEFAULT_HOST = "";
function readHttpServerOptions(config) {
  return {
    listen: readHttpListenOptions(config),
    https: readHttpsOptions(config)
  };
}
function readHttpListenOptions(config) {
  var _a, _b;
  const listen = config == null ? void 0 : config.getOptional("listen");
  if (typeof listen === "string") {
    const parts = String(listen).split(":");
    const port = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(port)) {
      if (parts.length === 1) {
        return { port, host: DEFAULT_HOST };
      }
      if (parts.length === 2) {
        return { host: parts[0], port };
      }
    }
    throw new Error(
      `Unable to parse listen address ${listen}, expected <port> or <host>:<port>`
    );
  }
  const host = (_a = config == null ? void 0 : config.getOptional("listen.host")) != null ? _a : DEFAULT_HOST;
  if (typeof host !== "string") {
    config == null ? void 0 : config.getOptionalString("listen.host");
    throw new Error("unreachable");
  }
  return {
    port: (_b = config == null ? void 0 : config.getOptionalNumber("listen.port")) != null ? _b : DEFAULT_PORT,
    host
  };
}
function readHttpsOptions(config) {
  const https = config == null ? void 0 : config.getOptional("https");
  if (https === true) {
    const baseUrl = config.getString("baseUrl");
    let hostname;
    try {
      hostname = new URL(baseUrl).hostname;
    } catch (error) {
      throw new Error(`Invalid baseUrl "${baseUrl}"`);
    }
    return { certificate: { type: "generated", hostname } };
  }
  const cc = config == null ? void 0 : config.getOptionalConfig("https");
  if (!cc) {
    return void 0;
  }
  return {
    certificate: {
      type: "pem",
      cert: cc.getString("certificate.cert"),
      key: cc.getString("certificate.key")
    }
  };
}

const FIVE_DAYS_IN_MS = 5 * 24 * 60 * 60 * 1e3;
const IP_HOSTNAME_REGEX = /:|^\d+\.\d+\.\d+\.\d+$/;
async function getGeneratedCertificate(hostname, logger) {
  const hasModules = await fs__default.default.pathExists("node_modules");
  let certPath;
  if (hasModules) {
    certPath = path.resolve(
      "node_modules/.cache/backstage-backend/dev-cert.pem"
    );
    await fs__default.default.ensureDir(path.dirname(certPath));
  } else {
    certPath = path.resolve(".dev-cert.pem");
  }
  if (await fs__default.default.pathExists(certPath)) {
    try {
      const cert = await fs__default.default.readFile(certPath);
      const crt = forge__default.default.pki.certificateFromPem(cert.toString());
      const remainingMs = crt.validity.notAfter.getTime() - Date.now();
      if (remainingMs > FIVE_DAYS_IN_MS) {
        logger.info("Using existing self-signed certificate");
        return {
          key: cert,
          cert
        };
      }
    } catch (error) {
      logger.warn(`Unable to use existing self-signed certificate, ${error}`);
    }
  }
  logger.info("Generating new self-signed certificate");
  const newCert = await generateCertificate(hostname);
  await fs__default.default.writeFile(certPath, newCert.cert + newCert.key, "utf8");
  return newCert;
}
async function generateCertificate(hostname) {
  const attributes = [
    {
      name: "commonName",
      value: "dev-cert"
    }
  ];
  const sans = [
    {
      type: 2,
      // DNS
      value: "localhost"
    },
    {
      type: 2,
      value: "localhost.localdomain"
    },
    {
      type: 2,
      value: "[::1]"
    },
    {
      type: 7,
      // IP
      ip: "127.0.0.1"
    },
    {
      type: 7,
      ip: "fe80::1"
    }
  ];
  if (!sans.find(({ value, ip }) => value === hostname || ip === hostname)) {
    sans.push(
      IP_HOSTNAME_REGEX.test(hostname) ? {
        type: 7,
        ip: hostname
      } : {
        type: 2,
        value: hostname
      }
    );
  }
  const params = {
    algorithm: "sha256",
    keySize: 2048,
    days: 30,
    extensions: [
      {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: "extKeyUsage",
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true
      },
      {
        name: "subjectAltName",
        altNames: sans
      }
    ]
  };
  return new Promise(
    (resolve, reject) => require("selfsigned").generate(
      attributes,
      params,
      (err, bundle) => {
        if (err) {
          reject(err);
        } else {
          resolve({ key: bundle.private, cert: bundle.cert });
        }
      }
    )
  );
}

async function createHttpServer(listener, options, deps) {
  const server = await createServer(listener, options, deps);
  const stopper = stoppableServer__default.default(server, 0);
  const stopServer = stopper.stop.bind(stopper);
  return Object.assign(server, {
    start() {
      return new Promise((resolve, reject) => {
        const handleStartupError = (error) => {
          server.close();
          reject(error);
        };
        server.on("error", handleStartupError);
        const { host, port } = options.listen;
        server.listen(port, host, () => {
          server.off("error", handleStartupError);
          deps.logger.info(`Listening on ${host}:${port}`);
          resolve();
        });
      });
    },
    stop() {
      return new Promise((resolve, reject) => {
        stopServer((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    },
    port() {
      const address = server.address();
      if (typeof address === "string" || address === null) {
        throw new Error(`Unexpected server address '${address}'`);
      }
      return address.port;
    }
  });
}
async function createServer(listener, options, deps) {
  if (options.https) {
    const { certificate } = options.https;
    if (certificate.type === "generated") {
      const credentials = await getGeneratedCertificate(
        certificate.hostname,
        deps.logger
      );
      return https__namespace.createServer(credentials, listener);
    }
    return https__namespace.createServer(certificate, listener);
  }
  return http__namespace.createServer(listener);
}

function readHelmetOptions(config) {
  const cspOptions = readCspDirectives(config);
  return {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: applyCspDirectives(cspOptions)
    },
    // These are all disabled in order to maintain backwards compatibility
    // when bumping helmet v5. We can't enable these by default because
    // there is no way for users to configure them.
    // TODO(Rugvip): We should give control of this setup to consumers
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false
  };
}
function readCspDirectives(config) {
  const cc = config == null ? void 0 : config.getOptionalConfig("csp");
  if (!cc) {
    return void 0;
  }
  const result = {};
  for (const key of cc.keys()) {
    if (cc.get(key) === false) {
      result[key] = false;
    } else {
      result[key] = cc.getStringArray(key);
    }
  }
  return result;
}
function applyCspDirectives(directives) {
  const result = helmet__default.default.contentSecurityPolicy.getDefaultDirectives();
  result["script-src"] = ["'self'", "'unsafe-eval'"];
  delete result["form-action"];
  if (directives) {
    for (const [key, value] of Object.entries(directives)) {
      if (value === false) {
        delete result[key];
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

function readCorsOptions(config) {
  const cc = config == null ? void 0 : config.getOptionalConfig("cors");
  if (!cc) {
    return { origin: false };
  }
  return removeUnknown({
    origin: createCorsOriginMatcher(readStringArray(cc, "origin")),
    methods: readStringArray(cc, "methods"),
    allowedHeaders: readStringArray(cc, "allowedHeaders"),
    exposedHeaders: readStringArray(cc, "exposedHeaders"),
    credentials: cc.getOptionalBoolean("credentials"),
    maxAge: cc.getOptionalNumber("maxAge"),
    preflightContinue: cc.getOptionalBoolean("preflightContinue"),
    optionsSuccessStatus: cc.getOptionalNumber("optionsSuccessStatus")
  });
}
function removeUnknown(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== void 0)
  );
}
function readStringArray(config, key) {
  const value = config.getOptional(key);
  if (typeof value === "string") {
    return [value];
  } else if (!value) {
    return void 0;
  }
  return config.getStringArray(key);
}
function createCorsOriginMatcher(allowedOriginPatterns) {
  if (!allowedOriginPatterns) {
    return void 0;
  }
  const allowedOriginMatchers = allowedOriginPatterns.map(
    (pattern) => new minimatch.Minimatch(pattern, { nocase: true, noglobstar: true })
  );
  return (origin, callback) => {
    return callback(
      null,
      allowedOriginMatchers.some((pattern) => pattern.match(origin != null ? origin : ""))
    );
  };
}

function handleBadError(error, logger) {
  const logId = crypto.randomBytes(10).toString("hex");
  logger.child({ logId }).error(`Filtered internal error with logId=${logId} from response`, error);
  const newError = new Error(`An internal error occurred logId=${logId}`);
  delete newError.stack;
  return newError;
}
function applyInternalErrorFilter(error, logger) {
  try {
    errors.assertError(error);
  } catch (assertionError) {
    errors.assertError(assertionError);
    return handleBadError(assertionError, logger);
  }
  const constructorName = error.constructor.name;
  if (constructorName === "DatabaseError") {
    return handleBadError(error, logger);
  }
  return error;
}

var __accessCheck$a = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$9 = (obj, member, getter) => {
  __accessCheck$a(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$a = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$9 = (obj, member, value, setter) => {
  __accessCheck$a(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _config, _logger;
const _MiddlewareFactory = class _MiddlewareFactory {
  constructor(options) {
    __privateAdd$a(this, _config, void 0);
    __privateAdd$a(this, _logger, void 0);
    __privateSet$9(this, _config, options.config);
    __privateSet$9(this, _logger, options.logger);
  }
  /**
   * Creates a new {@link MiddlewareFactory}.
   */
  static create(options) {
    return new _MiddlewareFactory(options);
  }
  /**
   * Returns a middleware that unconditionally produces a 404 error response.
   *
   * @remarks
   *
   * Typically you want to place this middleware at the end of the chain, such
   * that it's the last one attempted after no other routes matched.
   *
   * @returns An Express request handler
   */
  notFound() {
    return (_req, res) => {
      res.status(404).end();
    };
  }
  /**
   * Returns the compression middleware.
   *
   * @remarks
   *
   * The middleware will attempt to compress response bodies for all requests
   * that traverse through the middleware.
   */
  compression() {
    return compression__default.default();
  }
  /**
   * Returns a request logging middleware.
   *
   * @remarks
   *
   * Typically you want to place this middleware at the start of the chain, such
   * that it always logs requests whether they are "caught" by handlers farther
   * down or not.
   *
   * @returns An Express request handler
   */
  logging() {
    const logger = __privateGet$9(this, _logger).child({
      type: "incomingRequest"
    });
    return morgan__default.default("combined", {
      stream: {
        write(message) {
          logger.info(message.trimEnd());
        }
      }
    });
  }
  /**
   * Returns a middleware that implements the helmet library.
   *
   * @remarks
   *
   * This middleware applies security policies to incoming requests and outgoing
   * responses. It is configured using config keys such as `backend.csp`.
   *
   * @see {@link https://helmetjs.github.io/}
   *
   * @returns An Express request handler
   */
  helmet() {
    return helmet__default.default(readHelmetOptions(__privateGet$9(this, _config).getOptionalConfig("backend")));
  }
  /**
   * Returns a middleware that implements the cors library.
   *
   * @remarks
   *
   * This middleware handles CORS. It is configured using the config key
   * `backend.cors`.
   *
   * @see {@link https://github.com/expressjs/cors}
   *
   * @returns An Express request handler
   */
  cors() {
    return cors__default.default(readCorsOptions(__privateGet$9(this, _config).getOptionalConfig("backend")));
  }
  /**
   * Express middleware to handle errors during request processing.
   *
   * @remarks
   *
   * This is commonly the very last middleware in the chain.
   *
   * Its primary purpose is not to do translation of business logic exceptions,
   * but rather to be a global catch-all for uncaught "fatal" errors that are
   * expected to result in a 500 error. However, it also does handle some common
   * error types (such as http-error exceptions, and the well-known error types
   * in the `@backstage/errors` package) and returns the enclosed status code
   * accordingly.
   *
   * It will also produce a response body with a serialized form of the error,
   * unless a previous handler already did send a body. See
   * {@link @backstage/errors#ErrorResponseBody} for the response shape used.
   *
   * @returns An Express error request handler
   */
  error(options = {}) {
    var _a;
    const showStackTraces = (_a = options.showStackTraces) != null ? _a : process.env.NODE_ENV === "development";
    const logger = __privateGet$9(this, _logger).child({
      type: "errorHandler"
    });
    return (rawError, req, res, next) => {
      const error = applyInternalErrorFilter(rawError, logger);
      const statusCode = getStatusCode(error);
      if (options.logAllErrors || statusCode >= 500) {
        logger.error(`Request failed with status ${statusCode}`, error);
      }
      if (res.headersSent) {
        next(error);
        return;
      }
      const body = {
        error: errors.serializeError(error, { includeStack: showStackTraces }),
        request: { method: req.method, url: req.url },
        response: { statusCode }
      };
      res.status(statusCode).json(body);
    };
  }
};
_config = new WeakMap();
_logger = new WeakMap();
let MiddlewareFactory = _MiddlewareFactory;
function getStatusCode(error) {
  const knownStatusCodeFields = ["statusCode", "status"];
  for (const field of knownStatusCodeFields) {
    const statusCode = error[field];
    if (typeof statusCode === "number" && (statusCode | 0) === statusCode && // is whole integer
    statusCode >= 100 && statusCode <= 599) {
      return statusCode;
    }
  }
  switch (error.name) {
    case errors.NotModifiedError.name:
      return 304;
    case errors.InputError.name:
      return 400;
    case errors.AuthenticationError.name:
      return 401;
    case errors.NotAllowedError.name:
      return 403;
    case errors.NotFoundError.name:
      return 404;
    case errors.ConflictError.name:
      return 409;
    case errors.NotImplementedError.name:
      return 501;
    case errors.ServiceUnavailableError.name:
      return 503;
  }
  return 500;
}

const escapeRegExp = (text) => {
  return text.replace(/[.*+?^${}(\)|[\]\\]/g, "\\$&");
};

var __accessCheck$9 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$8 = (obj, member, getter) => {
  __accessCheck$9(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$9 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$8 = (obj, member, value, setter) => {
  __accessCheck$9(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _winston, _addRedactions;
const _WinstonLogger = class _WinstonLogger {
  constructor(winston, addRedactions) {
    __privateAdd$9(this, _winston, void 0);
    __privateAdd$9(this, _addRedactions, void 0);
    __privateSet$8(this, _winston, winston);
    __privateSet$8(this, _addRedactions, addRedactions);
  }
  /**
   * Creates a {@link WinstonLogger} instance.
   */
  static create(options) {
    var _a, _b;
    const redacter = _WinstonLogger.redacter();
    const defaultFormatter = process.env.NODE_ENV === "production" ? winston.format.json() : _WinstonLogger.colorFormat();
    let logger = winston.createLogger({
      level: process.env.LOG_LEVEL || options.level || "info",
      format: winston.format.combine(
        redacter.format,
        (_a = options.format) != null ? _a : defaultFormatter
      ),
      transports: (_b = options.transports) != null ? _b : new winston.transports.Console()
    });
    if (options.meta) {
      logger = logger.child(options.meta);
    }
    return new _WinstonLogger(logger, redacter.add);
  }
  /**
   * Creates a winston log formatter for redacting secrets.
   */
  static redacter() {
    const redactionSet = /* @__PURE__ */ new Set();
    let redactionPattern = void 0;
    return {
      format: winston.format((info) => {
        if (redactionPattern && typeof info.message === "string") {
          info.message = info.message.replace(redactionPattern, "[REDACTED]");
        }
        if (redactionPattern && typeof info.stack === "string") {
          info.stack = info.stack.replace(redactionPattern, "[REDACTED]");
        }
        return info;
      })(),
      add(newRedactions) {
        let added = 0;
        for (const redactionToTrim of newRedactions) {
          const redaction = redactionToTrim.trim();
          if (redaction.length <= 1) {
            continue;
          }
          if (!redactionSet.has(redaction)) {
            redactionSet.add(redaction);
            added += 1;
          }
        }
        if (added > 0) {
          const redactions = Array.from(redactionSet).map((r) => escapeRegExp(r)).join("|");
          redactionPattern = new RegExp(`(${redactions})`, "g");
        }
      }
    };
  }
  /**
   * Creates a pretty printed winston log formatter.
   */
  static colorFormat() {
    const colorizer = winston.format.colorize();
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize({
        colors: {
          timestamp: "dim",
          prefix: "blue",
          field: "cyan",
          debug: "grey"
        }
      }),
      winston.format.printf((info) => {
        const { timestamp, level, message, plugin, service, ...fields } = info;
        const prefix = plugin || service;
        const timestampColor = colorizer.colorize("timestamp", timestamp);
        const prefixColor = colorizer.colorize("prefix", prefix);
        const extraFields = Object.entries(fields).map(
          ([key, value]) => `${colorizer.colorize("field", `${key}`)}=${value}`
        ).join(" ");
        return `${timestampColor} ${prefixColor} ${level} ${message} ${extraFields}`;
      })
    );
  }
  error(message, meta) {
    __privateGet$8(this, _winston).error(message, meta);
  }
  warn(message, meta) {
    __privateGet$8(this, _winston).warn(message, meta);
  }
  info(message, meta) {
    __privateGet$8(this, _winston).info(message, meta);
  }
  debug(message, meta) {
    __privateGet$8(this, _winston).debug(message, meta);
  }
  child(meta) {
    return new _WinstonLogger(__privateGet$8(this, _winston).child(meta));
  }
  addRedactions(redactions) {
    var _a;
    (_a = __privateGet$8(this, _addRedactions)) == null ? void 0 : _a.call(this, redactions);
  }
};
_winston = new WeakMap();
_addRedactions = new WeakMap();
let WinstonLogger = _WinstonLogger;

var __accessCheck$8 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$7 = (obj, member, getter) => {
  __accessCheck$8(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$8 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$7 = (obj, member, value, setter) => {
  __accessCheck$8(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _hasStarted$1, _startupTasks$1, _hasShutdown, _shutdownTasks;
class BackendLifecycleImpl {
  constructor(logger) {
    this.logger = logger;
    __privateAdd$8(this, _hasStarted$1, false);
    __privateAdd$8(this, _startupTasks$1, []);
    __privateAdd$8(this, _hasShutdown, false);
    __privateAdd$8(this, _shutdownTasks, []);
  }
  addStartupHook(hook, options) {
    if (__privateGet$7(this, _hasStarted$1)) {
      throw new Error("Attempted to add startup hook after startup");
    }
    __privateGet$7(this, _startupTasks$1).push({ hook, options });
  }
  async startup() {
    if (__privateGet$7(this, _hasStarted$1)) {
      return;
    }
    __privateSet$7(this, _hasStarted$1, true);
    this.logger.debug(`Running ${__privateGet$7(this, _startupTasks$1).length} startup tasks...`);
    await Promise.all(
      __privateGet$7(this, _startupTasks$1).map(async ({ hook, options }) => {
        var _a;
        const logger = (_a = options == null ? void 0 : options.logger) != null ? _a : this.logger;
        try {
          await hook();
          logger.debug(`Startup hook succeeded`);
        } catch (error) {
          logger.error(`Startup hook failed, ${error}`);
        }
      })
    );
  }
  addShutdownHook(hook, options) {
    if (__privateGet$7(this, _hasShutdown)) {
      throw new Error("Attempted to add shutdown hook after shutdown");
    }
    __privateGet$7(this, _shutdownTasks).push({ hook, options });
  }
  async shutdown() {
    if (__privateGet$7(this, _hasShutdown)) {
      return;
    }
    __privateSet$7(this, _hasShutdown, true);
    this.logger.debug(
      `Running ${__privateGet$7(this, _shutdownTasks).length} shutdown tasks...`
    );
    await Promise.all(
      __privateGet$7(this, _shutdownTasks).map(async ({ hook, options }) => {
        var _a;
        const logger = (_a = options == null ? void 0 : options.logger) != null ? _a : this.logger;
        try {
          await hook();
          logger.debug(`Shutdown hook succeeded`);
        } catch (error) {
          logger.error(`Shutdown hook failed, ${error}`);
        }
      })
    );
  }
}
_hasStarted$1 = new WeakMap();
_startupTasks$1 = new WeakMap();
_hasShutdown = new WeakMap();
_shutdownTasks = new WeakMap();
const rootLifecycleServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.rootLifecycle,
  deps: {
    logger: backendPluginApi.coreServices.rootLogger
  },
  async factory({ logger }) {
    return new BackendLifecycleImpl(logger);
  }
});

var __accessCheck$7 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$6 = (obj, member, getter) => {
  __accessCheck$7(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$7 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$6 = (obj, member, value, setter) => {
  __accessCheck$7(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _hasStarted, _startupTasks;
class BackendPluginLifecycleImpl {
  constructor(logger, rootLifecycle, pluginMetadata) {
    this.logger = logger;
    this.rootLifecycle = rootLifecycle;
    this.pluginMetadata = pluginMetadata;
    __privateAdd$7(this, _hasStarted, false);
    __privateAdd$7(this, _startupTasks, []);
  }
  addStartupHook(hook, options) {
    if (__privateGet$6(this, _hasStarted)) {
      throw new Error("Attempted to add startup hook after startup");
    }
    __privateGet$6(this, _startupTasks).push({ hook, options });
  }
  async startup() {
    if (__privateGet$6(this, _hasStarted)) {
      return;
    }
    __privateSet$6(this, _hasStarted, true);
    this.logger.debug(
      `Running ${__privateGet$6(this, _startupTasks).length} plugin startup tasks...`
    );
    await Promise.all(
      __privateGet$6(this, _startupTasks).map(async ({ hook, options }) => {
        var _a;
        const logger = (_a = options == null ? void 0 : options.logger) != null ? _a : this.logger;
        try {
          await hook();
          logger.debug(`Plugin startup hook succeeded`);
        } catch (error) {
          logger.error(`Plugin startup hook failed, ${error}`);
        }
      })
    );
  }
  addShutdownHook(hook, options) {
    var _a, _b;
    const plugin = this.pluginMetadata.getId();
    this.rootLifecycle.addShutdownHook(hook, {
      logger: (_b = (_a = options == null ? void 0 : options.logger) == null ? void 0 : _a.child({ plugin })) != null ? _b : this.logger
    });
  }
}
_hasStarted = new WeakMap();
_startupTasks = new WeakMap();
const lifecycleServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.lifecycle,
  deps: {
    logger: backendPluginApi.coreServices.logger,
    rootLifecycle: backendPluginApi.coreServices.rootLifecycle,
    pluginMetadata: backendPluginApi.coreServices.pluginMetadata
  },
  async factory({ rootLifecycle, logger, pluginMetadata }) {
    return new BackendPluginLifecycleImpl(
      logger,
      rootLifecycle,
      pluginMetadata
    );
  }
});

var __accessCheck$6 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$5 = (obj, member, getter) => {
  __accessCheck$6(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$6 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$5 = (obj, member, value, setter) => {
  __accessCheck$6(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod$5 = (obj, member, method) => {
  __accessCheck$6(obj, member, "access private method");
  return method;
};
var _nodeIds, _cycleKeys, _getCycleKey, getCycleKey_fn, _nodes, _allProvided;
class Node {
  constructor(value, consumes, provides) {
    this.value = value;
    this.consumes = consumes;
    this.provides = provides;
  }
  static from(input) {
    return new Node(
      input.value,
      input.consumes ? new Set(input.consumes) : /* @__PURE__ */ new Set(),
      input.provides ? new Set(input.provides) : /* @__PURE__ */ new Set()
    );
  }
}
const _CycleKeySet = class _CycleKeySet {
  constructor(nodes) {
    __privateAdd$6(this, _getCycleKey);
    __privateAdd$6(this, _nodeIds, void 0);
    __privateAdd$6(this, _cycleKeys, void 0);
    __privateSet$5(this, _nodeIds, new Map(nodes.map((n, i) => [n.value, i])));
    __privateSet$5(this, _cycleKeys, /* @__PURE__ */ new Set());
  }
  static from(nodes) {
    return new _CycleKeySet(nodes);
  }
  tryAdd(path) {
    const cycleKey = __privateMethod$5(this, _getCycleKey, getCycleKey_fn).call(this, path);
    if (__privateGet$5(this, _cycleKeys).has(cycleKey)) {
      return false;
    }
    __privateGet$5(this, _cycleKeys).add(cycleKey);
    return true;
  }
};
_nodeIds = new WeakMap();
_cycleKeys = new WeakMap();
_getCycleKey = new WeakSet();
getCycleKey_fn = function(path) {
  return path.map((n) => __privateGet$5(this, _nodeIds).get(n)).sort().join(",");
};
let CycleKeySet = _CycleKeySet;
const _DependencyGraph = class _DependencyGraph {
  constructor(nodes) {
    __privateAdd$6(this, _nodes, void 0);
    __privateAdd$6(this, _allProvided, void 0);
    __privateSet$5(this, _nodes, nodes);
    __privateSet$5(this, _allProvided, /* @__PURE__ */ new Set());
    for (const node of __privateGet$5(this, _nodes).values()) {
      for (const produced of node.provides) {
        __privateGet$5(this, _allProvided).add(produced);
      }
    }
  }
  static fromMap(nodes) {
    return this.fromIterable(
      Object.entries(nodes).map(([key, node]) => ({
        value: String(key),
        ...node
      }))
    );
  }
  static fromIterable(nodeInputs) {
    const nodes = new Array();
    for (const nodeInput of nodeInputs) {
      nodes.push(Node.from(nodeInput));
    }
    return new _DependencyGraph(nodes);
  }
  /**
   * Find all nodes that consume dependencies that are not provided by any other node.
   */
  findUnsatisfiedDeps() {
    const unsatisfiedDependencies = [];
    for (const node of __privateGet$5(this, _nodes).values()) {
      const unsatisfied = Array.from(node.consumes).filter(
        (id) => !__privateGet$5(this, _allProvided).has(id)
      );
      if (unsatisfied.length > 0) {
        unsatisfiedDependencies.push({ value: node.value, unsatisfied });
      }
    }
    return unsatisfiedDependencies;
  }
  /**
   * Detect the first circular dependency within the graph, returning the path of nodes that
   * form a cycle, with the same node as the first and last element of the array.
   */
  detectCircularDependency() {
    return this.detectCircularDependencies().next().value;
  }
  /**
   * Detect circular dependencies within the graph, returning the path of nodes that
   * form a cycle, with the same node as the first and last element of the array.
   */
  *detectCircularDependencies() {
    const cycleKeys = CycleKeySet.from(__privateGet$5(this, _nodes));
    for (const startNode of __privateGet$5(this, _nodes)) {
      const visited = /* @__PURE__ */ new Set();
      const stack = new Array([
        startNode,
        [startNode.value]
      ]);
      while (stack.length > 0) {
        const [node, path] = stack.pop();
        if (visited.has(node)) {
          continue;
        }
        visited.add(node);
        for (const consumed of node.consumes) {
          const providerNodes = __privateGet$5(this, _nodes).filter(
            (other) => other.provides.has(consumed)
          );
          for (const provider of providerNodes) {
            if (provider === startNode) {
              if (cycleKeys.tryAdd(path)) {
                yield [...path, startNode.value];
              }
              break;
            }
            if (!visited.has(provider)) {
              stack.push([provider, [...path, provider.value]]);
            }
          }
        }
      }
    }
    return void 0;
  }
  /**
   * Traverses the dependency graph in topological order, calling the provided
   * function for each node and waiting for it to resolve.
   *
   * The nodes are traversed in parallel, but in such a way that no node is
   * visited before all of its dependencies.
   *
   * Dependencies of nodes that are not produced by any other nodes will be ignored.
   */
  async parallelTopologicalTraversal(fn) {
    const allProvided = __privateGet$5(this, _allProvided);
    const producedSoFar = /* @__PURE__ */ new Set();
    const waiting = new Set(__privateGet$5(this, _nodes).values());
    const visited = /* @__PURE__ */ new Set();
    const results = new Array();
    let inFlight = 0;
    async function processMoreNodes() {
      if (waiting.size === 0) {
        return;
      }
      const nodesToProcess = [];
      for (const node of waiting) {
        let ready = true;
        for (const consumed of node.consumes) {
          if (allProvided.has(consumed) && !producedSoFar.has(consumed)) {
            ready = false;
            continue;
          }
        }
        if (ready) {
          nodesToProcess.push(node);
        }
      }
      for (const node of nodesToProcess) {
        waiting.delete(node);
      }
      if (nodesToProcess.length === 0 && inFlight === 0) {
        throw new Error("Circular dependency detected");
      }
      await Promise.all(nodesToProcess.map(processNode));
    }
    async function processNode(node) {
      visited.add(node);
      inFlight += 1;
      const result = await fn(node.value);
      results.push(result);
      node.provides.forEach((produced) => producedSoFar.add(produced));
      inFlight -= 1;
      await processMoreNodes();
    }
    await processMoreNodes();
    return results;
  }
};
_nodes = new WeakMap();
_allProvided = new WeakMap();
let DependencyGraph = _DependencyGraph;

var __accessCheck$5 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$4 = (obj, member, getter) => {
  __accessCheck$5(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$5 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$4 = (obj, member, value, setter) => {
  __accessCheck$5(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod$4 = (obj, member, method) => {
  __accessCheck$5(obj, member, "access private method");
  return method;
};
var _providedFactories, _loadedDefaultFactories, _implementations, _rootServiceImplementations, _addedFactoryIds, _instantiatedFactories, _resolveFactory, resolveFactory_fn, _checkForMissingDeps, checkForMissingDeps_fn;
function toInternalServiceFactory(factory) {
  const f = factory;
  if (f.$$type !== "@backstage/BackendFeature") {
    throw new Error(`Invalid service factory, bad type '${f.$$type}'`);
  }
  if (f.version !== "v1") {
    throw new Error(`Invalid service factory, bad version '${f.version}'`);
  }
  return f;
}
const pluginMetadataServiceFactory = backendPluginApi.createServiceFactory(
  (options) => ({
    service: backendPluginApi.coreServices.pluginMetadata,
    deps: {},
    factory: async () => ({ getId: () => options == null ? void 0 : options.pluginId })
  })
);
const _ServiceRegistry = class _ServiceRegistry {
  constructor(factories) {
    __privateAdd$5(this, _resolveFactory);
    __privateAdd$5(this, _checkForMissingDeps);
    __privateAdd$5(this, _providedFactories, void 0);
    __privateAdd$5(this, _loadedDefaultFactories, void 0);
    __privateAdd$5(this, _implementations, void 0);
    __privateAdd$5(this, _rootServiceImplementations, /* @__PURE__ */ new Map());
    __privateAdd$5(this, _addedFactoryIds, /* @__PURE__ */ new Set());
    __privateAdd$5(this, _instantiatedFactories, /* @__PURE__ */ new Set());
    __privateSet$4(this, _providedFactories, new Map(
      factories.map((sf) => [sf.service.id, toInternalServiceFactory(sf)])
    ));
    __privateSet$4(this, _loadedDefaultFactories, /* @__PURE__ */ new Map());
    __privateSet$4(this, _implementations, /* @__PURE__ */ new Map());
  }
  static create(factories) {
    const registry = new _ServiceRegistry(factories);
    registry.checkForCircularDeps();
    return registry;
  }
  checkForCircularDeps() {
    const graph = DependencyGraph.fromIterable(
      Array.from(__privateGet$4(this, _providedFactories)).map(
        ([serviceId, serviceFactory]) => ({
          value: serviceId,
          provides: [serviceId],
          consumes: Object.values(serviceFactory.deps).map((d) => d.id)
        })
      )
    );
    const circularDependencies = Array.from(graph.detectCircularDependencies());
    if (circularDependencies.length) {
      const cycles = circularDependencies.map((c) => c.map((id) => `'${id}'`).join(" -> ")).join("\n  ");
      throw new errors.ConflictError(`Circular dependencies detected:
  ${cycles}`);
    }
  }
  add(factory) {
    const factoryId = factory.service.id;
    if (factoryId === backendPluginApi.coreServices.pluginMetadata.id) {
      throw new Error(
        `The ${backendPluginApi.coreServices.pluginMetadata.id} service cannot be overridden`
      );
    }
    if (__privateGet$4(this, _addedFactoryIds).has(factoryId)) {
      throw new Error(
        `Duplicate service implementations provided for ${factoryId}`
      );
    }
    if (__privateGet$4(this, _instantiatedFactories).has(factoryId)) {
      throw new Error(
        `Unable to set service factory with id ${factoryId}, service has already been instantiated`
      );
    }
    __privateGet$4(this, _addedFactoryIds).add(factoryId);
    __privateGet$4(this, _providedFactories).set(factoryId, toInternalServiceFactory(factory));
  }
  getServiceRefs() {
    return Array.from(__privateGet$4(this, _providedFactories).values()).map((f) => f.service);
  }
  get(ref, pluginId) {
    var _a;
    __privateGet$4(this, _instantiatedFactories).add(ref.id);
    return (_a = __privateMethod$4(this, _resolveFactory, resolveFactory_fn).call(this, ref, pluginId)) == null ? void 0 : _a.then((factory) => {
      if (factory.service.scope === "root") {
        let existing = __privateGet$4(this, _rootServiceImplementations).get(factory);
        if (!existing) {
          __privateMethod$4(this, _checkForMissingDeps, checkForMissingDeps_fn).call(this, factory, pluginId);
          const rootDeps = new Array();
          for (const [name, serviceRef] of Object.entries(factory.deps)) {
            if (serviceRef.scope !== "root") {
              throw new Error(
                `Failed to instantiate 'root' scoped service '${ref.id}' because it depends on '${serviceRef.scope}' scoped service '${serviceRef.id}'.`
              );
            }
            const target = this.get(serviceRef, pluginId);
            rootDeps.push(target.then((impl) => [name, impl]));
          }
          existing = Promise.all(rootDeps).then(
            (entries) => factory.factory(Object.fromEntries(entries), void 0)
          );
          __privateGet$4(this, _rootServiceImplementations).set(factory, existing);
        }
        return existing;
      }
      let implementation = __privateGet$4(this, _implementations).get(factory);
      if (!implementation) {
        __privateMethod$4(this, _checkForMissingDeps, checkForMissingDeps_fn).call(this, factory, pluginId);
        const rootDeps = new Array();
        for (const [name, serviceRef] of Object.entries(factory.deps)) {
          if (serviceRef.scope === "root") {
            const target = this.get(serviceRef, pluginId);
            rootDeps.push(target.then((impl) => [name, impl]));
          }
        }
        implementation = {
          context: Promise.all(rootDeps).then(
            (entries) => {
              var _a2;
              return (_a2 = factory.createRootContext) == null ? void 0 : _a2.call(factory, Object.fromEntries(entries));
            }
          ).catch((error) => {
            const cause = errors.stringifyError(error);
            throw new Error(
              `Failed to instantiate service '${ref.id}' because createRootContext threw an error, ${cause}`
            );
          }),
          byPlugin: /* @__PURE__ */ new Map()
        };
        __privateGet$4(this, _implementations).set(factory, implementation);
      }
      let result = implementation.byPlugin.get(pluginId);
      if (!result) {
        const allDeps = new Array();
        for (const [name, serviceRef] of Object.entries(factory.deps)) {
          const target = this.get(serviceRef, pluginId);
          allDeps.push(target.then((impl) => [name, impl]));
        }
        result = implementation.context.then(
          (context) => Promise.all(allDeps).then(
            (entries) => factory.factory(Object.fromEntries(entries), context)
          )
        ).catch((error) => {
          const cause = errors.stringifyError(error);
          throw new Error(
            `Failed to instantiate service '${ref.id}' for '${pluginId}' because the factory function threw an error, ${cause}`
          );
        });
        implementation.byPlugin.set(pluginId, result);
      }
      return result;
    });
  }
};
_providedFactories = new WeakMap();
_loadedDefaultFactories = new WeakMap();
_implementations = new WeakMap();
_rootServiceImplementations = new WeakMap();
_addedFactoryIds = new WeakMap();
_instantiatedFactories = new WeakMap();
_resolveFactory = new WeakSet();
resolveFactory_fn = function(ref, pluginId) {
  if (ref.id === backendPluginApi.coreServices.pluginMetadata.id) {
    return Promise.resolve(
      toInternalServiceFactory(pluginMetadataServiceFactory({ pluginId }))
    );
  }
  let resolvedFactory = __privateGet$4(this, _providedFactories).get(ref.id);
  const { __defaultFactory: defaultFactory } = ref;
  if (!resolvedFactory && !defaultFactory) {
    return void 0;
  }
  if (!resolvedFactory) {
    let loadedFactory = __privateGet$4(this, _loadedDefaultFactories).get(defaultFactory);
    if (!loadedFactory) {
      loadedFactory = Promise.resolve().then(() => defaultFactory(ref)).then(
        (f) => toInternalServiceFactory(typeof f === "function" ? f() : f)
      );
      __privateGet$4(this, _loadedDefaultFactories).set(defaultFactory, loadedFactory);
    }
    resolvedFactory = loadedFactory.catch((error) => {
      throw new Error(
        `Failed to instantiate service '${ref.id}' because the default factory loader threw an error, ${errors.stringifyError(
          error
        )}`
      );
    });
  }
  return Promise.resolve(resolvedFactory);
};
_checkForMissingDeps = new WeakSet();
checkForMissingDeps_fn = function(factory, pluginId) {
  const missingDeps = Object.values(factory.deps).filter((ref) => {
    if (ref.id === backendPluginApi.coreServices.pluginMetadata.id) {
      return false;
    }
    if (__privateGet$4(this, _providedFactories).get(ref.id)) {
      return false;
    }
    return !ref.__defaultFactory;
  });
  if (missingDeps.length) {
    const missing = missingDeps.map((r) => `'${r.id}'`).join(", ");
    throw new Error(
      `Failed to instantiate service '${factory.service.id}' for '${pluginId}' because the following dependent services are missing: ${missing}`
    );
  }
};
let ServiceRegistry = _ServiceRegistry;

var __accessCheck$4 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$3 = (obj, member, getter) => {
  __accessCheck$4(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$4 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$3 = (obj, member, value, setter) => {
  __accessCheck$4(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod$3 = (obj, member, method) => {
  __accessCheck$4(obj, member, "access private method");
  return method;
};
var _startPromise, _features, _extensionPoints, _serviceRegistry, _registeredFeatures, _getInitDeps, getInitDeps_fn, _addFeature, addFeature_fn, _doStart, doStart_fn, _getRootLifecycleImpl, getRootLifecycleImpl_fn, _getPluginLifecycleImpl, getPluginLifecycleImpl_fn;
class BackendInitializer {
  constructor(defaultApiFactories) {
    __privateAdd$4(this, _getInitDeps);
    __privateAdd$4(this, _addFeature);
    __privateAdd$4(this, _doStart);
    // Bit of a hacky way to grab the lifecycle services, potentially find a nicer way to do this
    __privateAdd$4(this, _getRootLifecycleImpl);
    __privateAdd$4(this, _getPluginLifecycleImpl);
    __privateAdd$4(this, _startPromise, void 0);
    __privateAdd$4(this, _features, new Array());
    __privateAdd$4(this, _extensionPoints, /* @__PURE__ */ new Map());
    __privateAdd$4(this, _serviceRegistry, void 0);
    __privateAdd$4(this, _registeredFeatures, new Array());
    __privateSet$3(this, _serviceRegistry, ServiceRegistry.create([...defaultApiFactories]));
  }
  add(feature) {
    if (__privateGet$3(this, _startPromise)) {
      throw new Error("feature can not be added after the backend has started");
    }
    __privateGet$3(this, _registeredFeatures).push(Promise.resolve(feature));
  }
  async start() {
    if (__privateGet$3(this, _startPromise)) {
      throw new Error("Backend has already started");
    }
    const exitHandler = async () => {
      process.removeListener("SIGTERM", exitHandler);
      process.removeListener("SIGINT", exitHandler);
      process.removeListener("beforeExit", exitHandler);
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    };
    process.addListener("SIGTERM", exitHandler);
    process.addListener("SIGINT", exitHandler);
    process.addListener("beforeExit", exitHandler);
    __privateSet$3(this, _startPromise, __privateMethod$3(this, _doStart, doStart_fn).call(this));
    await __privateGet$3(this, _startPromise);
  }
  async stop() {
    if (!__privateGet$3(this, _startPromise)) {
      return;
    }
    try {
      await __privateGet$3(this, _startPromise);
    } catch (error) {
    }
    const lifecycleService = await __privateMethod$3(this, _getRootLifecycleImpl, getRootLifecycleImpl_fn).call(this);
    await lifecycleService.shutdown();
  }
}
_startPromise = new WeakMap();
_features = new WeakMap();
_extensionPoints = new WeakMap();
_serviceRegistry = new WeakMap();
_registeredFeatures = new WeakMap();
_getInitDeps = new WeakSet();
getInitDeps_fn = async function(deps, pluginId, moduleId) {
  const result = /* @__PURE__ */ new Map();
  const missingRefs = /* @__PURE__ */ new Set();
  for (const [name, ref] of Object.entries(deps)) {
    const ep = __privateGet$3(this, _extensionPoints).get(ref.id);
    if (ep) {
      if (ep.pluginId !== pluginId) {
        throw new Error(
          `Illegal dependency: Module '${moduleId}' for plugin '${pluginId}' attempted to depend on extension point '${ref.id}' for plugin '${ep.pluginId}'. Extension points can only be used within their plugin's scope.`
        );
      }
      result.set(name, ep.impl);
    } else {
      const impl = await __privateGet$3(this, _serviceRegistry).get(
        ref,
        pluginId
      );
      if (impl) {
        result.set(name, impl);
      } else {
        missingRefs.add(ref);
      }
    }
  }
  if (missingRefs.size > 0) {
    const missing = Array.from(missingRefs).join(", ");
    throw new Error(
      `No extension point or service available for the following ref(s): ${missing}`
    );
  }
  return Object.fromEntries(result);
};
_addFeature = new WeakSet();
addFeature_fn = function(feature) {
  if (feature.$$type !== "@backstage/BackendFeature") {
    throw new Error(
      `Failed to add feature, invalid type '${feature.$$type}'`
    );
  }
  if (isServiceFactory(feature)) {
    __privateGet$3(this, _serviceRegistry).add(feature);
  } else if (isInternalBackendFeature(feature)) {
    if (feature.version !== "v1") {
      throw new Error(
        `Failed to add feature, invalid version '${feature.version}'`
      );
    }
    __privateGet$3(this, _features).push(feature);
  } else {
    throw new Error(
      `Failed to add feature, invalid feature ${JSON.stringify(feature)}`
    );
  }
};
_doStart = new WeakSet();
doStart_fn = async function() {
  __privateGet$3(this, _serviceRegistry).checkForCircularDeps();
  for (const feature of __privateGet$3(this, _registeredFeatures)) {
    __privateMethod$3(this, _addFeature, addFeature_fn).call(this, await feature);
  }
  const featureDiscovery = await __privateGet$3(this, _serviceRegistry).get(
    alpha.featureDiscoveryServiceRef,
    "root"
  );
  if (featureDiscovery) {
    const { features } = await featureDiscovery.getBackendFeatures();
    for (const feature of features) {
      __privateMethod$3(this, _addFeature, addFeature_fn).call(this, feature);
    }
    __privateGet$3(this, _serviceRegistry).checkForCircularDeps();
  }
  for (const ref of __privateGet$3(this, _serviceRegistry).getServiceRefs()) {
    if (ref.scope === "root") {
      await __privateGet$3(this, _serviceRegistry).get(ref, "root");
    }
  }
  const pluginInits = /* @__PURE__ */ new Map();
  const moduleInits = /* @__PURE__ */ new Map();
  for (const feature of __privateGet$3(this, _features)) {
    for (const r of feature.getRegistrations()) {
      const provides = /* @__PURE__ */ new Set();
      if (r.type === "plugin" || r.type === "module") {
        for (const [extRef, extImpl] of r.extensionPoints) {
          if (__privateGet$3(this, _extensionPoints).has(extRef.id)) {
            throw new Error(
              `ExtensionPoint with ID '${extRef.id}' is already registered`
            );
          }
          __privateGet$3(this, _extensionPoints).set(extRef.id, {
            impl: extImpl,
            pluginId: r.pluginId
          });
          provides.add(extRef);
        }
      }
      if (r.type === "plugin") {
        if (pluginInits.has(r.pluginId)) {
          throw new Error(`Plugin '${r.pluginId}' is already registered`);
        }
        pluginInits.set(r.pluginId, {
          provides,
          consumes: new Set(Object.values(r.init.deps)),
          init: r.init
        });
      } else {
        let modules = moduleInits.get(r.pluginId);
        if (!modules) {
          modules = /* @__PURE__ */ new Map();
          moduleInits.set(r.pluginId, modules);
        }
        if (modules.has(r.moduleId)) {
          throw new Error(
            `Module '${r.moduleId}' for plugin '${r.pluginId}' is already registered`
          );
        }
        modules.set(r.moduleId, {
          provides,
          consumes: new Set(Object.values(r.init.deps)),
          init: r.init
        });
      }
    }
  }
  const allPluginIds = [
    .../* @__PURE__ */ new Set([...pluginInits.keys(), ...moduleInits.keys()])
  ];
  await Promise.all(
    allPluginIds.map(async (pluginId) => {
      const modules = moduleInits.get(pluginId);
      if (modules) {
        const tree = DependencyGraph.fromIterable(
          Array.from(modules).map(([moduleId, moduleInit]) => ({
            value: { moduleId, moduleInit },
            // Relationships are reversed at this point since we're only interested in the extension points.
            // If a modules provides extension point A we want it to be initialized AFTER all modules
            // that depend on extension point A, so that they can provide their extensions.
            consumes: Array.from(moduleInit.provides).map((p) => p.id),
            provides: Array.from(moduleInit.consumes).map((c) => c.id)
          }))
        );
        const circular = tree.detectCircularDependency();
        if (circular) {
          throw new errors.ConflictError(
            `Circular dependency detected for modules of plugin '${pluginId}', ${circular.map(({ moduleId }) => `'${moduleId}'`).join(" -> ")}`
          );
        }
        await tree.parallelTopologicalTraversal(
          async ({ moduleId, moduleInit }) => {
            const moduleDeps = await __privateMethod$3(this, _getInitDeps, getInitDeps_fn).call(this, moduleInit.init.deps, pluginId, moduleId);
            await moduleInit.init.func(moduleDeps).catch((error) => {
              throw new errors.ForwardedError(
                `Module '${moduleId}' for plugin '${pluginId}' startup failed`,
                error
              );
            });
          }
        );
      }
      const pluginInit = pluginInits.get(pluginId);
      if (pluginInit) {
        const pluginDeps = await __privateMethod$3(this, _getInitDeps, getInitDeps_fn).call(this, pluginInit.init.deps, pluginId);
        await pluginInit.init.func(pluginDeps).catch((error) => {
          throw new errors.ForwardedError(
            `Plugin '${pluginId}' startup failed`,
            error
          );
        });
      }
      const lifecycleService2 = await __privateMethod$3(this, _getPluginLifecycleImpl, getPluginLifecycleImpl_fn).call(this, pluginId);
      await lifecycleService2.startup();
    })
  );
  const lifecycleService = await __privateMethod$3(this, _getRootLifecycleImpl, getRootLifecycleImpl_fn).call(this);
  await lifecycleService.startup();
  if (process.env.NODE_ENV !== "test") {
    const rootLogger = await __privateGet$3(this, _serviceRegistry).get(
      backendPluginApi.coreServices.rootLogger,
      "root"
    );
    process.on("unhandledRejection", (reason) => {
      var _a;
      (_a = rootLogger == null ? void 0 : rootLogger.child({ type: "unhandledRejection" })) == null ? void 0 : _a.error("Unhandled rejection", reason);
    });
    process.on("uncaughtException", (error) => {
      var _a;
      (_a = rootLogger == null ? void 0 : rootLogger.child({ type: "uncaughtException" })) == null ? void 0 : _a.error("Uncaught exception", error);
    });
  }
};
_getRootLifecycleImpl = new WeakSet();
getRootLifecycleImpl_fn = async function() {
  const lifecycleService = await __privateGet$3(this, _serviceRegistry).get(
    backendPluginApi.coreServices.rootLifecycle,
    "root"
  );
  if (lifecycleService instanceof BackendLifecycleImpl) {
    return lifecycleService;
  }
  throw new Error("Unexpected root lifecycle service implementation");
};
_getPluginLifecycleImpl = new WeakSet();
getPluginLifecycleImpl_fn = async function(pluginId) {
  const lifecycleService = await __privateGet$3(this, _serviceRegistry).get(
    backendPluginApi.coreServices.lifecycle,
    pluginId
  );
  if (lifecycleService instanceof BackendPluginLifecycleImpl) {
    return lifecycleService;
  }
  throw new Error("Unexpected plugin lifecycle service implementation");
};
function isServiceFactory(feature) {
  return !!feature.service;
}
function isInternalBackendFeature(feature) {
  return typeof feature.getRegistrations === "function";
}

var __accessCheck$3 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$2 = (obj, member, getter) => {
  __accessCheck$3(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$3 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$2 = (obj, member, value, setter) => {
  __accessCheck$3(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _initializer;
class BackstageBackend {
  constructor(defaultServiceFactories) {
    __privateAdd$3(this, _initializer, void 0);
    __privateSet$2(this, _initializer, new BackendInitializer(defaultServiceFactories));
  }
  add(feature) {
    if (isPromise(feature)) {
      __privateGet$2(this, _initializer).add(feature.then((f) => unwrapFeature(f.default)));
    } else {
      __privateGet$2(this, _initializer).add(unwrapFeature(feature));
    }
  }
  async start() {
    await __privateGet$2(this, _initializer).start();
  }
  async stop() {
    await __privateGet$2(this, _initializer).stop();
  }
}
_initializer = new WeakMap();
function isPromise(value) {
  return typeof value === "object" && value !== null && "then" in value && typeof value.then === "function";
}
function unwrapFeature(feature) {
  if (typeof feature === "function") {
    return feature();
  }
  if ("$$type" in feature) {
    return feature;
  }
  if ("default" in feature) {
    const defaultFeature = feature.default;
    return typeof defaultFeature === "function" ? defaultFeature() : defaultFeature;
  }
  return feature;
}

function createSpecializedBackend(options) {
  const services = options.defaultServiceFactories.map(
    (sf) => typeof sf === "function" ? sf() : sf
  );
  const exists = /* @__PURE__ */ new Set();
  const duplicates = /* @__PURE__ */ new Set();
  for (const { service } of services) {
    if (exists.has(service.id)) {
      duplicates.add(service.id);
    } else {
      exists.add(service.id);
    }
  }
  if (duplicates.size > 0) {
    const ids = Array.from(duplicates).join(", ");
    throw new Error(`Duplicate service implementations provided for ${ids}`);
  }
  if (exists.has(backendPluginApi.coreServices.pluginMetadata.id)) {
    throw new Error(
      `The ${backendPluginApi.coreServices.pluginMetadata.id} service cannot be overridden`
    );
  }
  return new BackstageBackend(services);
}

var __accessCheck$2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateAdd$2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateMethod$2 = (obj, member, method) => {
  __accessCheck$2(obj, member, "access private method");
  return method;
};
var _getJwtExpiration, getJwtExpiration_fn;
function createCredentialsWithServicePrincipal(sub, token) {
  return {
    $$type: "@backstage/BackstageCredentials",
    version: "v1",
    token,
    principal: {
      type: "service",
      subject: sub
    }
  };
}
function createCredentialsWithUserPrincipal(sub, token, expiresAt) {
  return {
    $$type: "@backstage/BackstageCredentials",
    version: "v1",
    token,
    expiresAt,
    principal: {
      type: "user",
      userEntityRef: sub
    }
  };
}
function createCredentialsWithNonePrincipal() {
  return {
    $$type: "@backstage/BackstageCredentials",
    version: "v1",
    principal: {
      type: "none"
    }
  };
}
function toInternalBackstageCredentials(credentials) {
  if (credentials.$$type !== "@backstage/BackstageCredentials") {
    throw new Error("Invalid credential type");
  }
  const internalCredentials = credentials;
  if (internalCredentials.version !== "v1") {
    throw new Error(
      `Invalid credential version ${internalCredentials.version}`
    );
  }
  return internalCredentials;
}
class DefaultAuthService {
  constructor(tokenManager, identity, pluginId, disableDefaultAuthPolicy) {
    this.tokenManager = tokenManager;
    this.identity = identity;
    this.pluginId = pluginId;
    this.disableDefaultAuthPolicy = disableDefaultAuthPolicy;
    __privateAdd$2(this, _getJwtExpiration);
  }
  // allowLimitedAccess is currently ignored, since we currently always use the full user tokens
  async authenticate(token) {
    const { sub, aud } = jose.decodeJwt(token);
    if (sub === "backstage-server" && !aud) {
      await this.tokenManager.authenticate(token);
      return createCredentialsWithServicePrincipal("external:backstage-plugin");
    }
    const identity = await this.identity.getIdentity({
      request: {
        headers: { authorization: `Bearer ${token}` }
      }
    });
    if (!identity) {
      throw new errors.AuthenticationError("Invalid user token");
    }
    return createCredentialsWithUserPrincipal(
      identity.identity.userEntityRef,
      token,
      __privateMethod$2(this, _getJwtExpiration, getJwtExpiration_fn).call(this, token)
    );
  }
  isPrincipal(credentials, type) {
    const principal = credentials.principal;
    if (type === "unknown") {
      return true;
    }
    if (principal.type !== type) {
      return false;
    }
    return true;
  }
  async getNoneCredentials() {
    return createCredentialsWithNonePrincipal();
  }
  async getOwnServiceCredentials() {
    return createCredentialsWithServicePrincipal(`plugin:${this.pluginId}`);
  }
  async getPluginRequestToken(options) {
    const internalForward = toInternalBackstageCredentials(options.onBehalfOf);
    const { type } = internalForward.principal;
    if (type === "none" && this.disableDefaultAuthPolicy) {
      return { token: "" };
    }
    switch (type) {
      case "service":
        return this.tokenManager.getToken();
      case "user":
        if (!internalForward.token) {
          throw new Error("User credentials is unexpectedly missing token");
        }
        return { token: internalForward.token };
      default:
        throw new errors.AuthenticationError(
          `Refused to issue service token for credential type '${type}'`
        );
    }
  }
  async getLimitedUserToken(credentials) {
    const internalCredentials = toInternalBackstageCredentials(credentials);
    const { token } = internalCredentials;
    if (!token) {
      throw new errors.AuthenticationError(
        "User credentials is unexpectedly missing token"
      );
    }
    return { token, expiresAt: __privateMethod$2(this, _getJwtExpiration, getJwtExpiration_fn).call(this, token) };
  }
}
_getJwtExpiration = new WeakSet();
getJwtExpiration_fn = function(token) {
  const { exp } = jose.decodeJwt(token);
  if (!exp) {
    throw new errors.AuthenticationError("User token is missing expiration");
  }
  return new Date(exp * 1e3);
};
const authServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.auth,
  deps: {
    config: backendPluginApi.coreServices.rootConfig,
    logger: backendPluginApi.coreServices.rootLogger,
    plugin: backendPluginApi.coreServices.pluginMetadata,
    identity: backendPluginApi.coreServices.identity,
    // Re-using the token manager makes sure that we use the same generated keys for
    // development as plugins that have not yet been migrated. It's important that this
    // keeps working as long as there are plugins that have not been migrated to the
    // new auth services in the new backend system.
    tokenManager: backendPluginApi.coreServices.tokenManager
  },
  async factory({ config, plugin, identity, tokenManager }) {
    const disableDefaultAuthPolicy = Boolean(
      config.getOptionalBoolean(
        "backend.auth.dangerouslyDisableDefaultAuthPolicy"
      )
    );
    return new DefaultAuthService(
      tokenManager,
      identity,
      plugin.getId(),
      disableDefaultAuthPolicy
    );
  }
});

const cacheServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.cache,
  deps: {
    config: backendPluginApi.coreServices.rootConfig,
    plugin: backendPluginApi.coreServices.pluginMetadata
  },
  async createRootContext({ config }) {
    return backendCommon.CacheManager.fromConfig(config);
  },
  async factory({ plugin }, manager) {
    return manager.forPlugin(plugin.getId()).getClient();
  }
});

const rootConfigServiceFactory = backendPluginApi.createServiceFactory(
  (options) => ({
    service: backendPluginApi.coreServices.rootConfig,
    deps: {},
    async factory() {
      const source = configLoader.ConfigSources.default({
        argv: options == null ? void 0 : options.argv,
        remote: options == null ? void 0 : options.remote,
        watch: options == null ? void 0 : options.watch
      });
      console.log(`Loading config from ${source}`);
      return await configLoader.ConfigSources.toConfig(source);
    }
  })
);

const databaseServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.database,
  deps: {
    config: backendPluginApi.coreServices.rootConfig,
    lifecycle: backendPluginApi.coreServices.lifecycle,
    pluginMetadata: backendPluginApi.coreServices.pluginMetadata
  },
  async createRootContext({ config: config$1 }) {
    return config$1.getOptional("backend.database") ? backendCommon.DatabaseManager.fromConfig(config$1) : backendCommon.DatabaseManager.fromConfig(
      new config.ConfigReader({
        backend: {
          database: { client: "better-sqlite3", connection: ":memory:" }
        }
      })
    );
  },
  async factory({ pluginMetadata, lifecycle }, databaseManager) {
    return databaseManager.forPlugin(pluginMetadata.getId(), {
      pluginMetadata,
      lifecycle
    });
  }
});

class HostDiscovery {
  constructor(internalBaseUrl, externalBaseUrl, discoveryConfig) {
    this.internalBaseUrl = internalBaseUrl;
    this.externalBaseUrl = externalBaseUrl;
    this.discoveryConfig = discoveryConfig;
  }
  /**
   * Creates a new HostDiscovery discovery instance by reading
   * from the `backend` config section, specifically the `.baseUrl` for
   * discovering the external URL, and the `.listen` and `.https` config
   * for the internal one.
   *
   * Can be overridden in config by providing a target and corresponding plugins in `discovery.endpoints`.
   * eg.
   * ```yaml
   * discovery:
   *  endpoints:
   *    - target: https://internal.example.com/internal-catalog
   *      plugins: [catalog]
   *    - target: https://internal.example.com/secure/api/{{pluginId}}
   *      plugins: [auth, permission]
   *    - target:
   *        internal: https://internal.example.com/search
   *        external: https://example.com/search
   *      plugins: [search]
   * ```
   *
   * The basePath defaults to `/api`, meaning the default full internal
   * path for the `catalog` plugin will be `http://localhost:7007/api/catalog`.
   */
  static fromConfig(config, options) {
    var _a;
    const basePath = (_a = options == null ? void 0 : options.basePath) != null ? _a : "/api";
    const externalBaseUrl = config.getString("backend.baseUrl").replace(/\/+$/, "");
    const {
      listen: { host: listenHost = "::", port: listenPort }
    } = backendAppApi.readHttpServerOptions(config.getConfig("backend"));
    const protocol = config.has("backend.https") ? "https" : "http";
    let host = listenHost;
    if (host === "::" || host === "") {
      host = "localhost";
    } else if (host === "0.0.0.0") {
      host = "127.0.0.1";
    }
    if (host.includes(":")) {
      host = `[${host}]`;
    }
    const internalBaseUrl = `${protocol}://${host}:${listenPort}`;
    return new HostDiscovery(
      internalBaseUrl + basePath,
      externalBaseUrl + basePath,
      config.getOptionalConfig("discovery")
    );
  }
  getTargetFromConfig(pluginId, type) {
    var _a, _b;
    const endpoints = (_a = this.discoveryConfig) == null ? void 0 : _a.getOptionalConfigArray("endpoints");
    const target = (_b = endpoints == null ? void 0 : endpoints.find((endpoint) => endpoint.getStringArray("plugins").includes(pluginId))) == null ? void 0 : _b.get("target");
    if (!target) {
      const baseUrl = type === "external" ? this.externalBaseUrl : this.internalBaseUrl;
      return `${baseUrl}/${encodeURIComponent(pluginId)}`;
    }
    if (typeof target === "string") {
      return target.replace(
        /\{\{\s*pluginId\s*\}\}/g,
        encodeURIComponent(pluginId)
      );
    }
    return target[type].replace(
      /\{\{\s*pluginId\s*\}\}/g,
      encodeURIComponent(pluginId)
    );
  }
  async getBaseUrl(pluginId) {
    return this.getTargetFromConfig(pluginId, "internal");
  }
  async getExternalBaseUrl(pluginId) {
    return this.getTargetFromConfig(pluginId, "external");
  }
}

const discoveryServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.discovery,
  deps: {
    config: backendPluginApi.coreServices.rootConfig
  },
  async factory({ config }) {
    return HostDiscovery.fromConfig(config);
  }
});

var __accessCheck$1 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$1 = (obj, member, getter) => {
  __accessCheck$1(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$1 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$1 = (obj, member, value, setter) => {
  __accessCheck$1(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod$1 = (obj, member, method) => {
  __accessCheck$1(obj, member, "access private method");
  return method;
};
var _auth, _discovery, _pluginId, _extractCredentialsFromRequest, extractCredentialsFromRequest_fn, _extractLimitedCredentialsFromRequest, extractLimitedCredentialsFromRequest_fn, _getCredentials, getCredentials_fn, _getLimitedCredentials, getLimitedCredentials_fn, _existingCookieExpiration, existingCookieExpiration_fn;
const FIVE_MINUTES_MS = 5 * 60 * 1e3;
const BACKSTAGE_AUTH_COOKIE = "backstage-auth";
function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string") {
    const matches = authHeader.match(/^Bearer[ ]+(\S+)$/i);
    const token = matches == null ? void 0 : matches[1];
    if (token) {
      return token;
    }
  }
  return void 0;
}
function getCookieFromRequest(req) {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookie.parse(cookieHeader);
    const token = cookies[BACKSTAGE_AUTH_COOKIE];
    if (token) {
      return token;
    }
  }
  return void 0;
}
function willExpireSoon(expiresAt) {
  return Date.now() + FIVE_MINUTES_MS > expiresAt.getTime();
}
const credentialsSymbol = Symbol("backstage-credentials");
const limitedCredentialsSymbol = Symbol("backstage-limited-credentials");
class DefaultHttpAuthService {
  constructor(auth, discovery, pluginId) {
    __privateAdd$1(this, _extractCredentialsFromRequest);
    __privateAdd$1(this, _extractLimitedCredentialsFromRequest);
    __privateAdd$1(this, _getCredentials);
    __privateAdd$1(this, _getLimitedCredentials);
    __privateAdd$1(this, _existingCookieExpiration);
    __privateAdd$1(this, _auth, void 0);
    __privateAdd$1(this, _discovery, void 0);
    __privateAdd$1(this, _pluginId, void 0);
    __privateSet$1(this, _auth, auth);
    __privateSet$1(this, _discovery, discovery);
    __privateSet$1(this, _pluginId, pluginId);
  }
  async credentials(req, options) {
    const credentials = (options == null ? void 0 : options.allowLimitedAccess) ? await __privateMethod$1(this, _getLimitedCredentials, getLimitedCredentials_fn).call(this, req) : await __privateMethod$1(this, _getCredentials, getCredentials_fn).call(this, req);
    const allowed = options == null ? void 0 : options.allow;
    if (!allowed) {
      return credentials;
    }
    if (__privateGet$1(this, _auth).isPrincipal(credentials, "none")) {
      if (allowed.includes("none")) {
        return credentials;
      }
      throw new errors.AuthenticationError("Missing credentials");
    } else if (__privateGet$1(this, _auth).isPrincipal(credentials, "user")) {
      if (allowed.includes("user")) {
        return credentials;
      }
      throw new errors.NotAllowedError(
        `This endpoint does not allow 'user' credentials`
      );
    } else if (__privateGet$1(this, _auth).isPrincipal(credentials, "service")) {
      if (allowed.includes("service")) {
        return credentials;
      }
      throw new errors.NotAllowedError(
        `This endpoint does not allow 'service' credentials`
      );
    }
    throw new errors.NotAllowedError(
      "Unknown principal type, this should never happen"
    );
  }
  async issueUserCookie(res, options) {
    if (res.headersSent) {
      throw new Error("Failed to issue user cookie, headers were already sent");
    }
    let credentials;
    if (options == null ? void 0 : options.credentials) {
      if (!__privateGet$1(this, _auth).isPrincipal(options.credentials, "user")) {
        throw new errors.AuthenticationError(
          "Refused to issue cookie for non-user principal"
        );
      }
      credentials = options.credentials;
    } else {
      credentials = await this.credentials(res.req, { allow: ["user"] });
    }
    const existingExpiresAt = await __privateMethod$1(this, _existingCookieExpiration, existingCookieExpiration_fn).call(this, res.req);
    if (existingExpiresAt && !willExpireSoon(existingExpiresAt)) {
      return { expiresAt: existingExpiresAt };
    }
    const originHeader = res.req.headers.origin;
    const origin = !originHeader || originHeader === "null" ? void 0 : originHeader;
    const externalBaseUrlStr = await __privateGet$1(this, _discovery).getExternalBaseUrl(
      __privateGet$1(this, _pluginId)
    );
    const externalBaseUrl = new URL(origin != null ? origin : externalBaseUrlStr);
    const { token, expiresAt } = await __privateGet$1(this, _auth).getLimitedUserToken(
      credentials
    );
    if (!token) {
      throw new Error("User credentials is unexpectedly missing token");
    }
    const secure = externalBaseUrl.protocol === "https:" || externalBaseUrl.hostname === "localhost";
    res.cookie(BACKSTAGE_AUTH_COOKIE, token, {
      domain: externalBaseUrl.hostname,
      httpOnly: true,
      expires: expiresAt,
      secure,
      priority: "high",
      sameSite: secure ? "none" : "lax"
    });
    return { expiresAt };
  }
}
_auth = new WeakMap();
_discovery = new WeakMap();
_pluginId = new WeakMap();
_extractCredentialsFromRequest = new WeakSet();
extractCredentialsFromRequest_fn = async function(req) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return await __privateGet$1(this, _auth).getNoneCredentials();
  }
  return await __privateGet$1(this, _auth).authenticate(token);
};
_extractLimitedCredentialsFromRequest = new WeakSet();
extractLimitedCredentialsFromRequest_fn = async function(req) {
  const token = getTokenFromRequest(req);
  if (token) {
    return await __privateGet$1(this, _auth).authenticate(token, {
      allowLimitedAccess: true
    });
  }
  const cookie = getCookieFromRequest(req);
  if (cookie) {
    return await __privateGet$1(this, _auth).authenticate(cookie, {
      allowLimitedAccess: true
    });
  }
  return await __privateGet$1(this, _auth).getNoneCredentials();
};
_getCredentials = new WeakSet();
getCredentials_fn = async function(req) {
  var _a;
  return (_a = req[credentialsSymbol]) != null ? _a : req[credentialsSymbol] = __privateMethod$1(this, _extractCredentialsFromRequest, extractCredentialsFromRequest_fn).call(this, req);
};
_getLimitedCredentials = new WeakSet();
getLimitedCredentials_fn = async function(req) {
  var _a;
  return (_a = req[limitedCredentialsSymbol]) != null ? _a : req[limitedCredentialsSymbol] = __privateMethod$1(this, _extractLimitedCredentialsFromRequest, extractLimitedCredentialsFromRequest_fn).call(this, req);
};
_existingCookieExpiration = new WeakSet();
existingCookieExpiration_fn = async function(req) {
  const existingCookie = getCookieFromRequest(req);
  if (!existingCookie) {
    return void 0;
  }
  try {
  const existingCredentials = await __privateGet$1(this, _auth).authenticate(existingCookie, {
    allowLimitedAccess: true
  });
  if (!__privateGet$1(this, _auth).isPrincipal(existingCredentials, "user")) {
    return void 0;
  }
  return existingCredentials.expiresAt;
  } catch (error) {
    if (error.name === 'AuthenticationError') {
      return undefined;
    }  
  }
};
const httpAuthServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.httpAuth,
  deps: {
    auth: backendPluginApi.coreServices.auth,
    discovery: backendPluginApi.coreServices.discovery,
    plugin: backendPluginApi.coreServices.pluginMetadata
  },
  async factory({ auth, discovery, plugin }) {
    return new DefaultHttpAuthService(auth, discovery, plugin.getId());
  }
});

const DEFAULT_TIMEOUT = { seconds: 5 };
function createLifecycleMiddleware(options) {
  const { lifecycle, startupRequestPauseTimeout = DEFAULT_TIMEOUT } = options;
  let state = "init";
  const waiting = /* @__PURE__ */ new Set();
  lifecycle.addStartupHook(async () => {
    if (state === "init") {
      state = "up";
      for (const item of waiting) {
        clearTimeout(item.timeout);
        item.next();
      }
      waiting.clear();
    }
  });
  lifecycle.addShutdownHook(async () => {
    state = "down";
    for (const item of waiting) {
      clearTimeout(item.timeout);
      item.next(new errors.ServiceUnavailableError("Service is shutting down"));
    }
    waiting.clear();
  });
  const timeoutMs = types.durationToMilliseconds(startupRequestPauseTimeout);
  return (_req, _res, next) => {
    if (state === "up") {
      next();
      return;
    } else if (state === "down") {
      next(new errors.ServiceUnavailableError("Service is shutting down"));
      return;
    }
    const item = {
      next,
      timeout: setTimeout(() => {
        if (waiting.delete(item)) {
          next(new errors.ServiceUnavailableError("Service has not started up yet"));
        }
      }, timeoutMs)
    };
    waiting.add(item);
  };
}

function createPathPolicyPredicate(policyPath) {
  if (policyPath === "/" || policyPath === "*") {
    return () => true;
  }
  const pathRegex = pathToRegexp.pathToRegexp(policyPath, void 0, {
    end: false
  });
  return (path) => {
    return pathRegex.test(path);
  };
}
function createCredentialsBarrier(options) {
  const { httpAuth, config } = options;
  const disableDefaultAuthPolicy = config.getOptionalBoolean(
    "backend.auth.dangerouslyDisableDefaultAuthPolicy"
  );
  if (disableDefaultAuthPolicy) {
    return {
      middleware: (_req, _res, next) => next(),
      addAuthPolicy: () => {
      }
    };
  }
  const unauthenticatedPredicates = new Array();
  const cookiePredicates = new Array();
  const middleware = (req, _, next) => {
    const allowsUnauthenticated = unauthenticatedPredicates.some(
      (predicate) => predicate(req.path)
    );
    if (allowsUnauthenticated) {
      next();
      return;
    }
    const allowsCookie = cookiePredicates.some(
      (predicate) => predicate(req.path)
    );
    httpAuth.credentials(req, {
      allow: ["user", "service"],
      allowLimitedAccess: allowsCookie
    }).then(
      () => next(),
      (err) => next(err)
    );
  };
  const addAuthPolicy = (policy) => {
    if (policy.allow === "unauthenticated") {
      unauthenticatedPredicates.push(createPathPolicyPredicate(policy.path));
    } else if (policy.allow === "user-cookie") {
      cookiePredicates.push(createPathPolicyPredicate(policy.path));
    } else {
      throw new Error("Invalid auth policy");
    }
  };
  return { middleware, addAuthPolicy };
}

const httpRouterServiceFactory = backendPluginApi.createServiceFactory(
  (options) => ({
    service: backendPluginApi.coreServices.httpRouter,
    deps: {
      plugin: backendPluginApi.coreServices.pluginMetadata,
      config: backendPluginApi.coreServices.rootConfig,
      lifecycle: backendPluginApi.coreServices.lifecycle,
      rootHttpRouter: backendPluginApi.coreServices.rootHttpRouter,
      httpAuth: backendPluginApi.coreServices.httpAuth
    },
    async factory({ httpAuth, config, plugin, rootHttpRouter, lifecycle }) {
      var _a;
      const getPath = (_a = options == null ? void 0 : options.getPath) != null ? _a : (id) => `/api/${id}`;
      const path = getPath(plugin.getId());
      const router = PromiseRouter__default.default();
      rootHttpRouter.use(path, router);
      const credentialsBarrier = createCredentialsBarrier({ httpAuth, config });
      router.use(createLifecycleMiddleware({ lifecycle }));
      router.use(credentialsBarrier.middleware);
      return {
        use(handler) {
          router.use(handler);
        },
        addAuthPolicy(policy) {
          credentialsBarrier.addAuthPolicy(policy);
        }
      };
    }
  })
);

const identityServiceFactory = backendPluginApi.createServiceFactory(
  (options) => ({
    service: backendPluginApi.coreServices.identity,
    deps: {
      discovery: backendPluginApi.coreServices.discovery
    },
    async factory({ discovery }) {
      return pluginAuthNode.DefaultIdentityClient.create({ discovery, ...options });
    }
  })
);

const loggerServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.logger,
  deps: {
    rootLogger: backendPluginApi.coreServices.rootLogger,
    plugin: backendPluginApi.coreServices.pluginMetadata
  },
  factory({ rootLogger, plugin }) {
    return rootLogger.child({ plugin: plugin.getId() });
  }
});

const permissionsServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.permissions,
  deps: {
    auth: backendPluginApi.coreServices.auth,
    config: backendPluginApi.coreServices.rootConfig,
    discovery: backendPluginApi.coreServices.discovery,
    tokenManager: backendPluginApi.coreServices.tokenManager
  },
  async factory({ auth, config, discovery, tokenManager }) {
    return pluginPermissionNode.ServerPermissionClient.fromConfig(config, {
      auth,
      discovery,
      tokenManager
    });
  }
});

var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _indexPath, _router, _namedRoutes, _indexRouter, _existingPaths, _findConflictingPath, findConflictingPath_fn;
function normalizePath(path) {
  return `${trimEnd__default.default(path, "/")}/`;
}
const _DefaultRootHttpRouter = class _DefaultRootHttpRouter {
  constructor(indexPath) {
    __privateAdd(this, _findConflictingPath);
    __privateAdd(this, _indexPath, void 0);
    __privateAdd(this, _router, express.Router());
    __privateAdd(this, _namedRoutes, express.Router());
    __privateAdd(this, _indexRouter, express.Router());
    __privateAdd(this, _existingPaths, new Array());
    __privateSet(this, _indexPath, indexPath);
    __privateGet(this, _router).use(__privateGet(this, _namedRoutes));
    if (__privateGet(this, _indexPath)) {
      __privateGet(this, _router).use(__privateGet(this, _indexRouter));
    }
  }
  static create(options) {
    let indexPath;
    if ((options == null ? void 0 : options.indexPath) === false) {
      indexPath = void 0;
    } else if ((options == null ? void 0 : options.indexPath) === void 0) {
      indexPath = "/api/app";
    } else if ((options == null ? void 0 : options.indexPath) === "") {
      throw new Error("indexPath option may not be an empty string");
    } else {
      indexPath = options.indexPath;
    }
    return new _DefaultRootHttpRouter(indexPath);
  }
  use(path, handler) {
    if (path.match(/^[/\s]*$/)) {
      throw new Error(`Root router path may not be empty`);
    }
    const conflictingPath = __privateMethod(this, _findConflictingPath, findConflictingPath_fn).call(this, path);
    if (conflictingPath) {
      throw new Error(
        `Path ${path} conflicts with the existing path ${conflictingPath}`
      );
    }
    __privateGet(this, _existingPaths).push(path);
    __privateGet(this, _namedRoutes).use(path, handler);
    if (__privateGet(this, _indexPath) === path) {
      __privateGet(this, _indexRouter).use(handler);
    }
  }
  handler() {
    return __privateGet(this, _router);
  }
};
_indexPath = new WeakMap();
_router = new WeakMap();
_namedRoutes = new WeakMap();
_indexRouter = new WeakMap();
_existingPaths = new WeakMap();
_findConflictingPath = new WeakSet();
findConflictingPath_fn = function(newPath) {
  const normalizedNewPath = normalizePath(newPath);
  for (const path of __privateGet(this, _existingPaths)) {
    const normalizedPath = normalizePath(path);
    if (normalizedPath.startsWith(normalizedNewPath)) {
      return path;
    }
    if (normalizedNewPath.startsWith(normalizedPath)) {
      return path;
    }
  }
  return void 0;
};
let DefaultRootHttpRouter = _DefaultRootHttpRouter;

function defaultConfigure(context) {
  const { app, routes, middleware } = context;
  app.use(middleware.helmet());
  app.use(middleware.cors());
  app.use(middleware.compression());
  app.use(middleware.logging());
  app.use(routes);
  app.use(middleware.notFound());
  app.use(middleware.error());
}
const rootHttpRouterServiceFactory = backendPluginApi.createServiceFactory(
  (options) => ({
    service: backendPluginApi.coreServices.rootHttpRouter,
    deps: {
      config: backendPluginApi.coreServices.rootConfig,
      rootLogger: backendPluginApi.coreServices.rootLogger,
      lifecycle: backendPluginApi.coreServices.rootLifecycle
    },
    async factory({ config, rootLogger, lifecycle }) {
      const { indexPath, configure = defaultConfigure } = options != null ? options : {};
      const logger = rootLogger.child({ service: "rootHttpRouter" });
      const app = express__default.default();
      const router = DefaultRootHttpRouter.create({ indexPath });
      const middleware = MiddlewareFactory.create({ config, logger });
      configure({
        app,
        routes: router.handler(),
        middleware,
        config,
        logger,
        lifecycle
      });
      const server = await createHttpServer(
        app,
        readHttpServerOptions(config.getOptionalConfig("backend")),
        { logger }
      );
      lifecycle.addShutdownHook(() => server.stop());
      await server.start();
      return router;
    }
  })
);

const rootLoggerServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.rootLogger,
  deps: {
    config: backendPluginApi.coreServices.rootConfig
  },
  async factory({ config }) {
    var _a;
    const logger = WinstonLogger.create({
      meta: {
        service: "backstage"
      },
      level: process.env.LOG_LEVEL || "info",
      format: process.env.NODE_ENV === "production" ? winston.format.json() : WinstonLogger.colorFormat(),
      transports: [new winston.transports.Console()]
    });
    const secretEnumerator = await createConfigSecretEnumerator({ logger });
    logger.addRedactions(secretEnumerator(config));
    (_a = config.subscribe) == null ? void 0 : _a.call(config, () => logger.addRedactions(secretEnumerator(config)));
    return logger;
  }
});

const schedulerServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.scheduler,
  deps: {
    plugin: backendPluginApi.coreServices.pluginMetadata,
    databaseManager: backendPluginApi.coreServices.database,
    logger: backendPluginApi.coreServices.logger
  },
  async factory({ plugin, databaseManager, logger }) {
    return backendTasks.TaskScheduler.forPlugin({
      pluginId: plugin.getId(),
      databaseManager,
      logger: backendCommon.loggerToWinstonLogger(logger)
    });
  }
});

const tokenManagerServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.tokenManager,
  deps: {
    config: backendPluginApi.coreServices.rootConfig,
    logger: backendPluginApi.coreServices.rootLogger
  },
  createRootContext({ config, logger }) {
    return backendCommon.ServerTokenManager.fromConfig(config, {
      logger
    });
  },
  async factory(_deps, tokenManager) {
    return tokenManager;
  }
});

const urlReaderServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.urlReader,
  deps: {
    config: backendPluginApi.coreServices.rootConfig,
    logger: backendPluginApi.coreServices.logger
  },
  async factory({ config, logger }) {
    return backendCommon.UrlReaders.default({
      config,
      logger: backendCommon.loggerToWinstonLogger(logger)
    });
  }
});

class DefaultUserInfoService {
  async getUserInfo(credentials) {
    const internalCredentials = toInternalBackstageCredentials(credentials);
    if (internalCredentials.principal.type !== "user") {
      throw new Error("Only user credentials are supported");
    }
    if (!internalCredentials.token) {
      throw new Error("User credentials is unexpectedly missing token");
    }
    const { sub: userEntityRef, ent: ownershipEntityRefs = [] } = jose.decodeJwt(
      internalCredentials.token
    );
    if (typeof userEntityRef !== "string") {
      throw new Error("User entity ref must be a string");
    }
    if (!Array.isArray(ownershipEntityRefs) || ownershipEntityRefs.some((ref) => typeof ref !== "string")) {
      throw new Error("Ownership entity refs must be an array of strings");
    }
    return { userEntityRef, ownershipEntityRefs };
  }
}
const userInfoServiceFactory = backendPluginApi.createServiceFactory({
  service: backendPluginApi.coreServices.userInfo,
  deps: {},
  async factory() {
    return new DefaultUserInfoService();
  }
});

exports.DefaultRootHttpRouter = DefaultRootHttpRouter;
exports.HostDiscovery = HostDiscovery;
exports.MiddlewareFactory = MiddlewareFactory;
exports.WinstonLogger = WinstonLogger;
exports.authServiceFactory = authServiceFactory;
exports.cacheServiceFactory = cacheServiceFactory;
exports.createConfigSecretEnumerator = createConfigSecretEnumerator;
exports.createHttpServer = createHttpServer;
exports.createLifecycleMiddleware = createLifecycleMiddleware;
exports.createSpecializedBackend = createSpecializedBackend;
exports.databaseServiceFactory = databaseServiceFactory;
exports.discoveryServiceFactory = discoveryServiceFactory;
exports.httpAuthServiceFactory = httpAuthServiceFactory;
exports.httpRouterServiceFactory = httpRouterServiceFactory;
exports.identityServiceFactory = identityServiceFactory;
exports.lifecycleServiceFactory = lifecycleServiceFactory;
exports.loadBackendConfig = loadBackendConfig;
exports.loggerServiceFactory = loggerServiceFactory;
exports.permissionsServiceFactory = permissionsServiceFactory;
exports.readCorsOptions = readCorsOptions;
exports.readHelmetOptions = readHelmetOptions;
exports.readHttpServerOptions = readHttpServerOptions;
exports.rootConfigServiceFactory = rootConfigServiceFactory;
exports.rootHttpRouterServiceFactory = rootHttpRouterServiceFactory;
exports.rootLifecycleServiceFactory = rootLifecycleServiceFactory;
exports.rootLoggerServiceFactory = rootLoggerServiceFactory;
exports.schedulerServiceFactory = schedulerServiceFactory;
exports.tokenManagerServiceFactory = tokenManagerServiceFactory;
exports.urlReaderServiceFactory = urlReaderServiceFactory;
exports.userInfoServiceFactory = userInfoServiceFactory;
//# sourceMappingURL=index.cjs.js.map