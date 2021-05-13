# Anvil gRPC Load-balancing example

You need to already have docker and docker-compose set up. More recent versions of Docker Desktop now have compose functionality through `docker compose`, which for this example can be used interchangably with `docker-compose`.

The sample Node.js client and server are from the v1.37.1 tag of https://github.com/grpc/grpc.

## Set up
If you want to run the client from your host, you will first need to `yarn install`. This requires that you already have Node setup locally.

You can then also run the server from your host, but we focus on using NGINX to proxy to the server to leverage the scaling and load-balancing capabilities.

## Start the server and proxy
`docker compose up --scale grpc=4`


## Start the client

### With load-balancing
Uses NGINX for more advanced routing and load-balancing:
```sh
# In docker:
docker compose run --rm grpc ./src/client.js --target nginx:50052 --iterations 10000 --batchSize 100

## OR

# On the host:
node ./src/client.js --target localhost:50052 --iterations 10000 --batchSize 100
```

### Without load-balancing
To run client connecting directly to the server (no load-balancing):
```sh
# In docker:
docker compose run --rm grpc ./src/client.js --target grpc:50051 --iterations 10000 --batchSize 100

## OR

# On the host (remember we used unallocated ports):
# First find the port of one of the instances
docker compose ps
## will output something like:
# NAME                     SERVICE             STATUS              PORTS
# cadvisor                 cAdvisor            running (healthy)   0.0.0.0:3003->8080/tcp
# grpc-lb-example_grpc_1   grpc                running             0.0.0.0:63608->50051/tcp
# grpc-lb-example_grpc_2   grpc                running             0.0.0.0:63610->50051/tcp
# grpc-lb-example_grpc_3   grpc                running             0.0.0.0:63609->50051/tcp
# grpc-lb-example_grpc_4   grpc                running             0.0.0.0:63612->50051/tcp
# nginx                    nginx               running             80/tcp, 0.0.0.0:50052->50052/tcp
node ./src/client.js --target localhost:<a host port you see above, like 63608> --iterations 10000 --batchSize 100
```
## Check out the container metrics
You can either view them via terminal:
```sh
docker stats
```

or using the browser through cAdvisor at `http://localhost:3003/docker/`