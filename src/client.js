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

const path = require('path');
const { promisify } = require('util');

const { timesSeries, times } = require('async');
const parseArgs = require('minimist');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

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
  const batchSize = argv.batchSize || 100;
  const logResponses = argv.logResponses || false;
  const user = argv._.length > 0
    ? argv._[0]
    : 'world';
  console.log({ target, iterations, batchSize, logResponses })


  const serversVisited = new Set();
  const client = new hello_proto.Greeter(target,
    grpc.credentials.createInsecure());

  const sayHello = promisify(client.sayHello).bind(client);
  const sayGoodbye = promisify(client.sayGoodbye).bind(client);
  
  // This is the function we want to run a total of `iterations` times in batches
  // of size `batchSize`
  const fnToRunInBatches = async (n, next) => {
    function handleResponse (message) {
      if (message) {
        if (logResponses) console.log('Response:', message);
        serversVisited.add(message.split(' ').pop());
      }
    }
    const payload = { name: user };
    try {
      const { message } = await sayHello(payload);
      handleResponse(message);
    } catch (err) {
      console.error(err);
      return next(err, null);
    }
    try {
      const { message } = await sayGoodbye(payload);
      handleResponse(message);
    } catch (err) {
      console.error(err);
      return next(err, null);
    }

    // Add delay after the last run in a batchSize to not hammer the server
    if (n === (batchSize-1)) {
      const sleepMS = 100;
      await new Promise(resolve => setTimeout(resolve, sleepMS));
      console.log('Batch finished...')
    }

    next(null, null);
  };

  // Handles the batching behavior we want
  const numberOfBatchesToRun = Math.round(iterations / batchSize);
  timesSeries(
    numberOfBatchesToRun,
    // function to run for `numberOfBatchesToRun` times in series
    (__, next) => times(batchSize, fnToRunInBatches, next),
    // function to run after all our requests are done
    () => console.log('serversVisited', Array.from(serversVisited)),
  )
}

main();
