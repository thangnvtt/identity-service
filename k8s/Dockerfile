FROM node:16
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn
RUN yarn generate:prisma
RUN yarn build
CMD ["yarn", "start"]