FROM node:14.4.0

WORKDIR /home/node/app_browser/build

COPY . .

EXPOSE 1991

RUN yarn global add serve
CMD ["serve", "-p", "1991", "-s", "."]