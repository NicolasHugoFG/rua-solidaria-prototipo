FROM node:20

WORKDIR /app

# Copy everything except what's in .dockerignore
COPY . .

# Install dependencies
RUN npm install

# Expose the port your server uses
EXPOSE 3000

# Run your server with tsx
CMD [ "npx", "tsx", "server.ts" ]

