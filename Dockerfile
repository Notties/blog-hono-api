# Stage 1: Base Image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Stage 2: Install Dependencies
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 3: Build the Application
FROM install AS build
COPY . .
RUN bun run build

# Stage 4: Production Image
FROM debian:bookworm-slim
WORKDIR /app

COPY --from=build /usr/src/app/dist/server .

EXPOSE 3000

CMD ["./server"]