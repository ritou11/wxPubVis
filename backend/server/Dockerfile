FROM node:8-alpine

RUN apk --no-cache add yarn

COPY . .

RUN yarn

CMD ["yarn", "start:prod"]
