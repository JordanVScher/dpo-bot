# pull official base image
FROM node:13.12.0-alpine
ENV DEBUG=*

# set working directory
WORKDIR /home/node/app_browser

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
# COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent

# add app
COPY . ./
EXPOSE 1992

# start app
# RUN npm run react_build
COPY ./src/entrypoint.sh /usr/local/bin/
ENTRYPOINT ["entrypoint.sh"]