"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("reflect-metadata");
const _http = /*#__PURE__*/ _interop_require_default(require("http"));
const _app = /*#__PURE__*/ _interop_require_default(require("./app"));
const _logger = /*#__PURE__*/ _interop_require_default(require("@/utils/logger"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const port = process.env.PORT || 8000;
const server = _http.default.createServer(_app.default);
_app.default.use((req, res)=>{
    res.status(500).json({
        code: false,
        message: "Invalid Api."
    });
});
const onError = (error)=>{
    if (error.syscall !== "listen") {
        throw error;
    }
    const addr = server.address();
    const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
    switch(error.code){
        case "EACCES":
            _logger.default.error(`${bind} requires elevated privileges`);
            process.exit(1);
        case "EADDRINUSE":
            _logger.default.error(`${bind} is already in use`);
            process.exit(1);
        default:
            throw error;
    }
};
const onListening = ()=>{
    const addr = server.address();
    const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
    _logger.default.info(`Listening on ${bind}`);
};
server.on("error", onError);
server.on("listening", onListening);
server.listen(port, ()=>{
    _logger.default.info(`Server Started:\n>> http://localhost:${port}\n>> ${process.env.NODE_ENV} mode\n\n`);
});

//# sourceMappingURL=index.js.map