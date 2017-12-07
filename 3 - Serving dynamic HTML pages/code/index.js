const Boom = require('boom');
const Hapi = require('hapi');
const Inert = require('inert');
const Path = require('path');
const Vision = require('vision');

const Ads = require('./data/ads');
const Posts = require('./data/posts');

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
            title
        },
        helpersPath: 'helpers'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return h.view('home', {
                posts: Posts
            });
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