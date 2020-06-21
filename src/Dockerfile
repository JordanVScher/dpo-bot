FROM node:11.13.0

WORKDIR /home/node/app_browser

COPY . .

EXPOSE 1991

RUN yarn global add serve
CMD ["serve", "-p", "1991", "-s", "."]