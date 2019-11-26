FROM node:8-alpine
WORKDIR /app
RUN apk --no-cache add yarn
COPY . /app
# ubuntu 添加根证书相关操作
RUN cd ~ \
  && mkdir .anyproxy \
  && cd .anyproxy \
  && mv /app/certificates ~/.anyproxy/ \
  && cp ~/.anyproxy/certificates/rootCA.crt /usr/local/share/ca-certificates/ \
  && update-ca-certificates \
  && cd /app \
  && yarn
CMD ["yarn", "start"]
