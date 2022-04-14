# CENTRAL GLOSSARY OF APPLICATON

## Custom Middleware Local Authentication: isAuth()

ADD MIDDLEWARES INTO ROUTE HANDLER AS ARGUMENT.
Check if the current User is logged in. LogIn status by express-session middleware.

ADD as many Arguments/ Middleware we want => Parsed from the left to right (request)
So if the User is logged in => next() middleware => getAddProduct

If User is not logged in => return res.redirect(); No 'next' middleware

The **args** WILL be propably inserted into an array with the help of the ...rest operator

## Custom Middleware Global Session: haveActiveSession()

CHECK IF CURRENT USER HAS AN ACTIVE SESSIOIN:
if so:

*req.user* will survive cross request because the userId is stored in the sessionStore
it will have session data loaded / if no session was found session object by default

req.user : req object property
NEED mongoose model methods to work with the document
STORE THAT USER IN REQUEST to use it anywhere in app

else:

call next() middleware function (Route Filter)

---

## Regular Middleware Global Configuration: template/ view engine (ejs)

About the *args*:
reserved keys --> views (dir to dynamic views - default = /views) & views engine -> tell express for any dynnmaic templates trying to render;

req.render() => a special function will be there to render the template file and
transform it to an actual html file and send it back to the browser as response

Initialization:

app.set("view engine" : String, "ejs" : String);
app.set("views" : String, "views" : String)

app.get(key, value) = access global set variables

## Regular Middleware Local Authentication: express-session

Initialization:

app.use(session({secret, resave, saveUninitialized, store}))
SESSION CONFIGRUATION - ARGS

1. secret: used for signing the HASH which secretly stores our ID in the cookie / key for encrypting cookies

2. resafe: session will not be saved on every request that is done, so on every response that is sent but only if something changed in the session => improve perfomance

3. saveUnitialized: no session gets saved for a request where it doesn't need to be saved because nothing was changed about it

4. cookie: configuration for session cookie like Max-Age; Http-Only; Expires

Advantage: each request brings a cookie => this cookie identifies a session (parsed by session middleware) => collectionData in req.session thus: now the user is available for every (accross) request object from the same window / tab -> which identifies a particular session by the session id

---
