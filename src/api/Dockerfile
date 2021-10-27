FROM node:14-alpine3.10

RUN mkdir /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node .env* ./

ENV NODE_ENV=test
USER node
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node ./ ./

RUN npm run build
WORKDIR /home/node/app

CMD ["node", "server.js"]
