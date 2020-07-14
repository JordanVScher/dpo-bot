FROM node:14.4.0

WORKDIR /home/node/app_browser/

COPY . .

EXPOSE 1991

RUN yarn add react-scripts
RUN yarn run react:build

RUN yarn global add serve
CMD ["serve", "public", "-p", "1991"]
#CMD ["serve", "build", "-p", "1991", "-s", "."]
