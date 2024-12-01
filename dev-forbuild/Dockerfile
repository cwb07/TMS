# dev Dockerfile
# base image from tar file
FROM node:22-alpine

# working directory where subsequent commands like RUN will run in
WORKDIR /app

# install the dependencies from tgz
COPY 3api-1.0.0.tgz .
RUN npm install 3api-1.0.0.tgz

# copy all files in current directory to current WORKDIR
# COPY . .

# bring the node_modules from tgz out to root
# compare the package.json in the tgz with the local package.json, if they are different, exit
#RUN cmp node_modules/3api/package.json package.json || exit 1

# # move the contents of node_modules in the tgz to the root node_modules the local path
# RUN mv -f node_modules/tms-backend/node_modules/* node_modules

# # remove the tms-backend directory
# RUN rm -rf node_modules/tms-backend

# # remove the tgz file
# RUN rm tms-backend-1.0.0.tgz

# # owner rwx, group rx, others rx
# RUN chmod -R 755 /app
# USER node

# command to run the server when the container starts
# CMD ["node", "server.js"]

CMD ["sh"]