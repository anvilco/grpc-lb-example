/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const _ = require('lodash');
const parseArgs = require('minimist');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const PROTO_PATH = path.join(__dirname, '/../protos/helloworld.proto');
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function main() {
  const argv = parseArgs(process.argv.slice(2), { string: 'target' });
  const target = argv.target || 'localhost:50051';
  const iterations = argv.iterations || 100;
  const logResponses = argv.logResponses || false;
  const user = argv._.length > 0
    ? argv._[0]
    : 'world';
  console.log({ target, iterations })


  const serversVisited = new Set();
  const client = new hello_proto.Greeter(target,
    grpc.credentials.createInsecure());

  // Call the the services iterations times
  _.times(iterations, (i) => {
  
    client.sayHello({ name: user }, function(err, response) {
      if (err) {
        console.error(err)
      }
      const msg = response?.message
      if (msg) {
        if (logResponses) console.log('Response:', msg);
        serversVisited.add(msg.split(' ').pop())
      }
      if (i === (iterations-1)) {
        console.log('serversVisited', Array.from(serversVisited))
      }
    });

    client.sayGoodbye({ name: user }, function(err, response) {
      if (err) {
        console.error(err)
      }
      const msg = response?.message
      if (msg) {
        if (logResponses) console.log('Response:', msg);
        serversVisited.add(msg.split(' ').pop())
      }
    });
  })
}

main();
