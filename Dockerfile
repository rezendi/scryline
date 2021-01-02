FROM node:14-slim
WORKDIR /usr/src/app
RUN npm uninstall cypress
COPY / ./
RUN npm install
RUN npm run build
