FROM node:11.13.0

WORKDIR /home/node/app

COPY . .
RUN yarn

EXPOSE 1990

CMD ["yarn", "start"]

