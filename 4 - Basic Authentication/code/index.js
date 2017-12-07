const Boom = require('boom');
const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const HapiAuthBasic = require('hapi-auth-basic');
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
    await server.register(HapiAuthBasic);

    server.auth.strategy('restricted', 'basic', {
        validate: async function (request, username, password) {

            const user = Users[username];

            if (!user) {
                return { isValid: false };
            }

            if (!await Bcrypt.compare(password, user.password)) {
                return { isValid: false };
            }

            return { isValid: true, credentials: user };
        }
    });

    server.views({
        relativeTo: Path.join(__dirname, 'templates'),
        engines: {
            hbs: require('handlebars')
        },
        isCached: false,
        layout: true,
        partialsPath: 'partials',
        context: {
            ads: Ads,
            title: 'THOUGHTS BY ME'
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
            auth: 'restricted'
        },
        handler: function (request, h) {

            const user = request.auth.credentials;
            return h.view('restricted', { user });
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