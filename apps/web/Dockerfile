FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY tsconfig.json next.config.ts ./
COPY src/ ./src/

ENV NEXT_PUBLIC_API_URL=http://api:8000

EXPOSE 3000

CMD ["npm", "run", "dev"]
