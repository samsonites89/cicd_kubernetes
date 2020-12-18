FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm config set strict-ssl false && \ 
    npm config set proxy=http://70.10.15.10:8080 \
    npm config set https-proxy=http://70.10.15.10:8080
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8000

CMD [ "node", "nodeserver.js" ]
