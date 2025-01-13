# ====================================
# Build the frontend
# ====================================
FROM node:20 AS frontend

WORKDIR /app/frontend

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY .frontend /app/frontend
RUN pnpm install && pnpm run build


# ====================================
# Backend
# ====================================
FROM python:3.11 AS build

WORKDIR /app

ENV PYTHONPATH=/app

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Install Chromium for web loader
# Can disable this if you don't use the web loader to reduce the image size
# RUN apt update && apt install -y chromium chromium-driver

# Install dependencies
COPY ./pyproject.toml ./poetry.lock* /app/
RUN poetry install --no-root --no-cache --only main

# ====================================
# Release
# ====================================
FROM build AS release

COPY --from=frontend /app/frontend/out /app/static

COPY . .

# Remove frontend code
RUN rm -rf .frontend

EXPOSE 8000

CMD ["poetry", "run", "prod"]