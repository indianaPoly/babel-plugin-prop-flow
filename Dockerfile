FROM node:18-slim

WORKDIR /app

ADD https://github.com/indianaPoly/babel-plugin-prop-flow/raw/main/src/index.js /babel-plugin/babel-plugin-prop-flow.js

CMD ["bash"]