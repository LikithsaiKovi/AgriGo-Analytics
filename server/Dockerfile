FROM node:18-bullseye

WORKDIR /app

# System deps (Python for the scheme fetcher + build tools for sqlite3)
RUN apt-get update \
  && apt-get install -y python3 python3-pip python-is-python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

# Install backend deps
COPY package*.json ./
RUN npm install --only=production

# Install Python deps used by gov_schemes_fetcher.py
COPY requirements.txt ./requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]

