# Anvil gRPC Load-balancing example

You need to already have docker and docker-compose setup. More recent versions of Docker Desktop now have compose functionality through `docker compose`, which for this example can be used interchangably with `docker-compose`.

The sample Node.js client and server are from the v1.37.1 tag of https://github.com/grpc/grpc.

## Set up
If you want to run the client from your host, you will first need to `yarn install`. This requires that you already have Node setup locally.

You can then also run the server from your host, but we focus on using Docker for the server to leverage the scaling and load-balancing capabilities.

## Start the server and proxy
`docker compose up --scale grpc=4`


## Start the client

In docker:
`docker compose exec grpc node ./src/client.js --target grpc:50051`

On the host:
`node ./src/client.js --target localhost:50051`