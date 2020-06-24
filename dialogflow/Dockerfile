FROM node:11.13.0

WORKDIR /home/node/app_df

COPY . .
RUN yarn

EXPOSE 1992

CMD ["yarn", "start:dialogflow"]
