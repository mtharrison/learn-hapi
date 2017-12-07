const Hapi = require('hapi');

const server = Hapi.server({ port: 4000 });

server.route({
    path: '/hello',
    method: 'GET',
    handler: function (request, h) {

        return 'Hello World!';
    }
});

server.route({
    path: '/world',
    method: 'GET',
    handler: function (request, h) {

        return {
            hello: 'world',
            name: 'hapi'
        };
    }
});

const start = async () => {

    await server.start();

    console.log('Started server listening on %s', server.info.uri);
};

start();
