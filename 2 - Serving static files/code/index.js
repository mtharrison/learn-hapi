const Hapi = require('hapi');
const Inert = require('inert');
const Path = require('path');

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

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.'
            }
        }
    });

    await server.start();

    console.log('Server started listening on %s', server.info.uri);
};

start();