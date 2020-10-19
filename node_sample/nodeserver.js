'use strict';


const Wallet = require('ethereumjs-wallet');
const { networkInterfaces } = require('os');

const http = require('http');

const host = '127.0.0.1';
const port = 8000;


//create a server object:
let server = http.createServer(function (req, res) {

    switch (req.url) {
        case "/":
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('Hello World!'); //write a response to the client
            res.end(); //end the response
            break;

        // get the current date
        case "/date":
            let currentDate = new Date();
            let date = currentDate.getDate();
            let month = currentDate.getMonth(); //Be careful! January is 0 not 1
            let year = currentDate.getFullYear();

            let dateString = date + "-" +(month + 1) + "-" + year;

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('The current date is : ' + dateString); //write a response to the client
            res.end(); //end the response
            break;

        case "/ethWallet":

            var addressData = Wallet.generate();

            var privateKey = addressData.getPrivateKeyString();
            var ethAddress = addressData.getAddressString();

            console.log(`Private key = , ${privateKey}`);
            console.log(`Address = , ${ethAddress}`);

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ private_key: privateKey , eth_addr: ethAddress }));

            break;

        case "/network":
            const nets = networkInterfaces();
            const results = Object.create(null); // or just '{}', an empty object

            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
                    if (net.family === 'IPv4' && !net.internal) {
                        if (!results[name]) {
                            results[name] = [];
                        }

                        results[name].push(net.address);
                    }
                }
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ network: results }));


        default:
            res.writeHead(404);
            res.end(JSON.stringify({error:"Resource not found"}));
    }

});//the server object listens on port 8080

server.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});


// Add Graceful shutdown
process.on('SIGTERM', function onSigterm () {
    console.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString());
    // start graceful shutdown here
    shutdown();
});