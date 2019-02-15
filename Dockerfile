FROM node:8.10

RUN  apt-get update && apt-get install -y vim
RUN mkdir -p /boundary-geojson

COPY . /boundary-geojson

WORKDIR /boundary-geojson

RUN npm install --registry=https://registry.npm.taobao.org

EXPOSE 3000

CMD [ "npm", "start" ]
