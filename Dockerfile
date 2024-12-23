FROM node:lts AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY .env .env
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Install dependencies
RUN yarn install
RUN npx prisma db push
RUN yarn build

EXPOSE 3001

# Command to run the application
CMD ["yarn", "start"]