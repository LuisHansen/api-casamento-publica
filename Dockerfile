FROM keymetrics/pm2:latest-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i --omit=dev

# Bundle app source
COPY . .

EXPOSE 8000
CMD [ "npm", "run", "prod"]
