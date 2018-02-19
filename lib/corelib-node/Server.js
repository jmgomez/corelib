"use strict";
const express = require("express");
const winston = require("winston");
const jsonwebtoken = require("jsonwebtoken");
const body_parser_1 = require("body-parser");
const morgan = require("morgan");
const Factory_1 = require("../core/Factory");
const unless = require("express-unless");
const Mappers_1 = require("../core/Mappers");
const Models_1 = require("../core/Models");
const Repository_1 = require("../server/Repository");
const Routers_1 = require("./Routers");
const Routes_1 = require("./Routes");
const dotenv = require("dotenv");
const Utils_1 = require("../core/Utils");
const PORT = 8001;
function getTokenFromRequest(request) {
    let token = null;
    if (request.headers[ServerProperties.Auth] && request.headers[ServerProperties.Auth].split(' ')[0] === 'Bearer')
        token = request.headers[ServerProperties.Auth].split(' ')[1];
    return Utils_1.MonadUtils.CreateMaybeFromNullable(token);
}
function authMiddleware(authService) {
    let authMiddleware = (req, res, next) => getTokenFromRequest(req).caseOf({
        just: token => {
            Factory_1.Factory.getLoginService().setCredentials(authService.getCredentialsFrom(token));
            next();
        },
        nothing: () => {
            res.redirect("/");
            // res.sendStatus(401);
        }
    });
    authMiddleware.unless = unless;
    return authMiddleware;
}
class Server {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.app.use(body_parser_1.json());
        this.app.use(morgan("combined"));
        this.app.use(express.static('public'));
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
            res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, https://ocg.jmgomez.me,  auth, sub_id, authorization,bellefield-callertimezoneoffset,bellefield-callerutctime,bellefield-callerutctimezoneid,bellefield-servicecalltraceid,content-type");
            next();
        });
    }
    secureServer() {
        let authService = ServerFactory.getAuthService();
        this.app.use(authMiddleware(authService)
            .unless({ path: [Routes_1.Routes.login, Routes_1.Routes.validate, Routes_1.Routes.validateResult, 'public'], method: 'OPTIONS' }));
    }
    setupRoutes() {
        this.app.get("/", (req, res) => {
            res.status(200).send("Server running ...");
        });
        this.addRoute(Routes_1.Routes.scopes, Routers_1.routerForSub(Factory_1.Factory.getLoginService(), Factory_1.Factory.getScopeRepository(), Mappers_1.scopeFromJSONWithScopes));
        this.addRoute(Routes_1.Routes.codes, Routers_1.routerForSub(Factory_1.Factory.getLoginService(), Factory_1.Factory.getCodeRepository(), Models_1.Code.fromJSON));
        this.addRoute(Routes_1.Routes.validate, Routers_1.getValidatorRouter());
        this.addRoute(Routes_1.Routes.validateResult, Routers_1.getValidatorResultRouter());
        this.addRoute(Routes_1.Routes.login, Routers_1.getLoginRouter(ServerFactory.getAuthService()));
        // this.addRoute(Routes.clientLogin, getClientLogin())
    }
    addRoute(basePath, router) {
        this.app.use(basePath, router);
    }
    start() {
        this.setupRoutes();
        this.server = this.app.listen(this.port, () => {
            winston.log("info", "--> Server successfully started at port %d", this.port);
        });
    }
    end() {
        this.server.close();
        winston.log("info", "--> Server closed. The port %d is available again", this.port);
    }
}
exports.Server = Server;
class ServerConfiguration {
    equals(b) {
        return this.id === b.id;
    }
    static fromJSON(json) {
        let sc = new ServerConfiguration();
        sc.id = json.id;
        sc.port = json.port;
        sc.mongoConnectionString = json.mongoConnectionString;
        return sc;
    }
}
exports.ServerConfiguration = ServerConfiguration;
function start() {
    dotenv.config({ path: './env' });
    let server = new Server(process.env.PORT);
    setupFactory();
    console.log(process.env.node_env, "That's the env");
    server.secureServer();
    server.start();
    return server;
}
exports.start = start;
function setupFactory() {
    Factory_1.Factory.setLoginService(new LoginService());
    // let url = "mongodb://localhost:27017/testDB";
    let scopeRepository = new Repository_1.MongoRepository(process.env.MONGO_DB, "scopes", Mappers_1.scopeFromJSONWithScopes);
    // let scopeRepository = new SyncReactiveRepository(new FileLocalRepository("./data/scopes.json", scopeFromJSONWithScopes));
    // let codeRepository = new SyncReactiveRepository(new FileLocalRepository("./data/codes.json", Code.fromJSON));
    let codeRepository = new Repository_1.MongoRepository(process.env.MONGO_DB, "codes", Models_1.Code.fromJSON);
    Factory_1.Factory.setCodeRepository(codeRepository);
    Factory_1.Factory.setScopeRepository(scopeRepository);
}
exports.setupFactory = setupFactory;
class ServerFactory {
    static getAuthService() {
        if (ServerFactory.authService == null)
            ServerFactory.authService = new AuthService(ServerFactory.SECRET);
        return ServerFactory.authService;
    }
}
ServerFactory.SECRET = "shh";
exports.ServerFactory = ServerFactory;
//SAMPLE
// {
//     "given_name": "Assistant",
//     "family_name": "User",
//     "email": "standarduser@garcia-sanchez.com",
//     "http://schemas.bellefield.com/targetsubscriptionid": "38",
//     "http://schemas.bellefield.com/targetuserid": "191",
//     "http://schemas.bellefield.com/deviceid": "123123123",
//     "http://schemas.bellefield.com/permisions": "*Delegate:Access**Delegate:Users**Delegate:Timekeeper**Subscription:Access**Subscription:Delegate*",
//
//     "iss": "http://bellefield.com",
//     "aud": "http://bellefield.com"
// }
class LoginService {
    setCredentials(cred) {
        console.log("Setting credentials ", cred);
        this.cred = cred;
    }
    getCredentials() {
        console.log("Reqeusting credentials ", this.cred);
        return this.cred;
    }
}
exports.LoginService = LoginService;
class AuthService {
    constructor(secret) {
        this.secret = secret;
    }
    getCredentialsFrom(token) {
        // let c = new Credentials();
        // c.id = "1";
        // c.sub = 10;
        // c.username ="Whatever";
        // return c;
        console.log(token);
        let cred = jsonwebtoken.decode(token.replace("Bearer ", ""));
        console.log(cred);
        return cred;
        // let cred = <Credentials>(req.headers[ServerProperties.Auth]); //CHECK FOR ERRORS
        // return cred;
    }
    canAccess(cred) {
        return true; //Check permissions here.
    }
    generateToken(cred) {
        return jsonwebtoken.sign(cred, this.secret, { expiresIn: 60 * 60 });
    }
}
exports.AuthService = AuthService;
class ServerProperties {
}
ServerProperties.Auth = "auth";
