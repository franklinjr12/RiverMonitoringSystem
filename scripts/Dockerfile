FROM node:18

RUN apt-get update && apt-get install -y \
    ruby-full \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY entrypoint.sh /workspace/entrypoint.sh
RUN chmod +x /workspace/entrypoint.sh

ENTRYPOINT ["/workspace/scripts/entrypoint.sh"]
# CMD ["bash"]

