FROM node:18.12.1
WORKDIR /app
COPY . .
RUN npm install
COPY . .
EXPOSE 2708
CMD [ "node", "./bin/www" ]
