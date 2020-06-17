FROM node:11.13.0

WORKDIR /home/node/app_df

COPY . .
RUN npm install

EXPOSE 1991

RUN node ./dialogflow/server.js
# COPY ./dialogflow/entrypoint.sh /usr/local/bin/
# ENTRYPOINT ["entrypoint.sh"]

