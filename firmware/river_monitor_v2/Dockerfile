# -------------------------------------------------------------
# Build stage
# -------------------------------------------------------------
FROM debian:stable-slim AS builder

# Install build tools and curl dev libs
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        libcurl4-openssl-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy source
COPY . /app

# to ensure always latest build
RUN touch /app/.force_rebuild

# Build the linux firmware binary
# Adjust file list as needed if you add more .c files
RUN gcc \
    core/app.c \
    core/json_builder.c \
    core/config.c \
    platform/linux/implementations.c \
    platform/linux/main.c \
    -Icore \
    -Iplatform/linux \
    -o river_monitor \
    -lcurl

CMD ["./river_monitor"]
# CMD ["bash"]
