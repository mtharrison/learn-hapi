const Bcrypt = require('bcrypt');
const Boom = require('boom');
const Hapi = require('hapi');
const HapiAuthCookie = require('hapi-auth-cookie');
const Inert = require('inert');
const Path = require('path');
const Vision = require('vision');

const Ads = require('./data/ads');
const Posts = require('./data/posts');
const Users = require('./data/users');

const server = Hapi.server({
    port: 4000,
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
});

const start = async () => {

    await server.register(Inert);
    await server.register(Vision);
    await server.register(HapiAuthCookie);

    server.auth.strategy('restricted', 'cookie', {
        password: 'Td2sXhE4Eghk8MBA3X96hgMqd66k8r2P',
        cookie: 'session',
        isSecure: false,
        redirectTo: '/login',
        redirectOnTry: false,
        validateFunc: (request, cookie) => {

            const user = Users[cookie.username];
            return { valid: user !== undefined, credentials: user };
        }
    });

    server.auth.default({ strategy: 'restricted', mode: 'try' });

    server.views({
        relativeTo: Path.join(__dirname, 'templates'),
        engines: {
            hbs: require('handlebars')
        },
        isCached: false,
        layout: true,
        partialsPath: 'partials',
        context: (request) => {

            return {
                ads: Ads,
                title: 'THOUGHTS BY ME',
                user: request.auth.credentials
            };
        },
        helpersPath: 'helpers'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return h.view('home', { posts: Posts });
        }
    });

    server.route({
        method: 'GET',
        path: '/restricted',
        options: {
            auth: {
                strategy: 'restricted',
                mode: 'required'
            }
        },
        handler: function (request, h) {

            return h.view('restricted');
        }
    });

    server.route({
        method: 'GET',
        path: '/login',
        handler: function (request, h) {

            return h.view('login');
        }
    });

    server.route({
        method: 'GET',
        path: '/logout',
        handler: function (request, h) {

            request.cookieAuth.clear();
            return h.redirect('/');
        }
    });

    server.route({
        method: 'POST',
        path: '/login',
        handler: async function (request, h) {

            const { username, password } = request.payload;
            const user = Users[username];

            if (!user ||
                !await Bcrypt.compare(password, user.password)) {

                return h.view('login', { error: true });
            }

            request.cookieAuth.set({ username });

            return h.redirect('/restricted');
        }
    });

    server.route({
        method: 'GET',
        path: '/contact',
        handler: function (request, h) {

            return h.view('contact');
        }
    });

    server.route({
        method: 'GET',
        path: '/post/{id}',
        handler: function (request, h) {

            const id = request.params.id;

            const post = Posts[id - 1];

            if (!post) {
                throw Boom.notFound();
            }

            return h.view('post', { post });
        }
    });

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: { path: '.' }
        }
    });

    await server.start();

    console.log('Server started listening on %s', server.info.uri);
};

start();