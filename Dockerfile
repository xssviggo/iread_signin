FROM node:alpine3.13

WORKDIR /usr/src/app

COPY . ./
CMD [ "node", "index.js" ]
