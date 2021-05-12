FROM node:16

COPY . /home/node/

WORKDIR /home/node
RUN yarn install

USER node

ENTRYPOINT [ "node" ]