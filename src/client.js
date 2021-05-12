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
  let target;
  if (argv.target) {
    target = argv.target;
    console.log({ target })
  } else {
    target = 'localhost:50051';
  }
  const client = new hello_proto.Greeter(target,
                                       grpc.credentials.createInsecure());
  let user;
  if (argv._.length > 0) {
    user = argv._[0]; 
  } else {
    user = 'world';
  }
  _.times(10, () => {
    client.sayHello({name: user}, function(err, response) {
      if (err) {
        console.error(err)
      }
      console.log('Response:', response?.message);
    });
  })

  _.times(10, () => {
    client.sayGoodbye({name: user}, function(err, response) {
      if (err) {
        console.error(err)
      }
      console.log('Response:', response?.message);
    });
  })
}

main();
