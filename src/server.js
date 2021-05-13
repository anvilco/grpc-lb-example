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
const crypto = require("crypto");

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
const hello_world_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

/**
 * Create a random ID for each server
 */
const id = crypto.randomBytes(5).toString('hex');

/**
 * Implements the RPC service methods.
 */
function sayHello(call, callback) {
  callback(null, {
    message: 'Hello ' + call.request.name + ' from ' + id,
  });
}
function sayGoodbye(call, callback) {
  callback(null, {
    message: 'See you next time ' + call.request.name + ' from ' + id,
  });
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  const server = new grpc.Server();
  server.addService(hello_world_proto.Greeter.service, {
    sayHello,
    sayGoodbye,
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`Server ${id} up!`)
  });
}

main();
