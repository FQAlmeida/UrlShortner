FROM node:14

RUN mkdir /app
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

RUN apt-get update && apt-get install netcat -y

ADD package.json yarn.lock /app/
RUN yarn install

ADD entrypoint.sh /app
ENTRYPOINT [ "sh", "/app/entrypoint.sh" ]

CMD [ "yarn", "start" ]
