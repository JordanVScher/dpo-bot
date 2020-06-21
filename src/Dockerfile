FROM node:11.13.0 AS builder

WORKDIR /home/node/app

COPY . .
RUN yarn run react_build
RUN yarn global add serve

COPY --from=builder /app/build .

EXPOSE 1991

CMD ["yarn", "run" "react_serve"]


