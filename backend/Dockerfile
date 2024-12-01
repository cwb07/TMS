# internet facing Dockerfile
# base image to use
FROM node:22-alpine

# working directory where subsequent commands like RUN will run in
WORKDIR /app

# copy all files in current directory to current WORKDIR
COPY . .

#install the dependencies
# add a non-root user
# -D means do not assign a password, -H means do not create a home directory
# 755: owner rwx, group rx, others rx
RUN npm install && \
    adduser -D -H developer && \
    chmod -R 755 /app

# change to non-root user
USER developer

#command to run the server when the container starts
CMD ["node", "server.js"]