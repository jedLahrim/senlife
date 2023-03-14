FROM node:14.15.1-alpine

WORKDIR event_app
COPY package.json .

RUN npm install
COPY . .



CMD ["npm", "run", "start"]