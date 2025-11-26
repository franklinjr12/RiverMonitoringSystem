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

# Build the linux firmware binary
# Adjust file list as needed if you add more .c files
RUN gcc \
    core/app.c \
    core/json_builder.c \
    core/config.c \
    platform/linux/main.c \
    platform/linux/implementations.c \
    -Icore \
    -Iplatform/linux \
    -o river_monitor \
    -lcurl


# -------------------------------------------------------------
# Runtime stage (smaller image)
# -------------------------------------------------------------
# FROM debian:stable-slim

# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#         curl && \
#     rm -rf /var/lib/apt/lists/*

# WORKDIR /app

# # bring binary
# COPY --from=builder /app/river_monitor /app/river_monitor

# # bring initial config if present
# COPY --from=builder /app/config.txt /app/ 2>/dev/null || true

# Default command runs the firmware
CMD ["./river_monitor"]
# CMD ["bash"]
