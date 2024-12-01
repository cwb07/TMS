# dev Dockerfile
# base image from tar file
FROM node:22-alpine

# working directory where subsequent commands like RUN will run in
WORKDIR /app

# install the dependencies from tgz
COPY 3api-1.0.0.tgz .
RUN npm install 3api-1.0.0.tgz

# copy all files in current directory to current WORKDIR
COPY . .

# compare the package.json in the tgz with the local package.json, if they are different, exit
RUN cmp node_modules/3api/package.json package.json || exit -1

# bring the node_modules from tgz out to root
# move the contents of node_modules in the tgz to the root node_modules the local path
RUN mv node_modules/3api/node_modules/* node_modules

# remove the 3api directory
RUN rm -r node_modules/3api

# remove the tgz file
RUN rm 3api-1.0.0.tgz

# add a non-root user
# -D means do not assign a password, -H means do not create a home directory
# 755: owner rwx, group rx, others rx
RUN adduser -D -H developer && \
    chmod -R 755 /app

# change to non-root user
USER developer

# command to run the server when the container starts
CMD ["node", "server.js"]