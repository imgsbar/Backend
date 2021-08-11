FROM node:14
WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY tsconfig.json ./

COPY typings /app/typings
COPY src /app/src

RUN yarn build

EXPOSE 8080

HEALTHCHECK CMD curl --fail http://localhost:8080/v2/health || exit 1

CMD [ "yarn", "start" ]
