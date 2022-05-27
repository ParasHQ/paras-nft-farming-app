FROM node:14.19.1

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN ["yarn", "install"]

COPY .env.temp .env
COPY . .

RUN yarn build

ENTRYPOINT [ "yarn", "start" ]
