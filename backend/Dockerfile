# internet Dockerfile
# base image to use
FROM node:22-alpine3.19

# subsequent commands will run in this directory
# sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD
WORKDIR /app

# copy the package.json to the container
COPY package.json .

# install the dependencies
RUN npm install

# copy the rest of the application
COPY . .

# owner rwx, group rx, others rx
RUN chmod -R 755 /app
USER node

# command to run the server when the container starts
CMD ["node", "server.js"]