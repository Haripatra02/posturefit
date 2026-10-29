FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace manifests
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json* ./client/
COPY server/package.json server/package-lock.json* ./server/

# Install dependencies
RUN npm install
RUN npm --prefix server install
RUN npm --prefix client install

# Copy source
COPY . .

# Build both client and server
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json ./
COPY server/package.json ./server/
COPY server/node_modules ./server/node_modules
COPY server/dist ./server/dist
COPY client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
