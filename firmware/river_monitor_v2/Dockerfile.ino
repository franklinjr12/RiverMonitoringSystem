# build with
# docker build -f Dockerfile.ino -t river_monitor_v2 .
# run with (mounts host output folder to container)
# docker run -v $(pwd)/output:/app/output river_monitor_v2

FROM ubuntu:latest

WORKDIR /app

RUN apt update && apt upgrade -y

RUN apt install -y curl python3

RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

RUN bin/arduino-cli core install esp32:esp32 && \
    bin/arduino-cli update && \
    bin/arduino-cli upgrade

COPY . /app

# Copy core C files into the sketch directory so Arduino CLI can compile them
# Arduino CLI only compiles files in the sketch directory (where the .ino file is)
RUN cp core/*.h platform/esp32/ && \
    cp core/app.c platform/esp32/app.cpp && \
    cp core/config.c platform/esp32/config.cpp && \
    cp core/json_builder.c platform/esp32/json_builder.cpp

# use DIO flash mode for the current test board
# the following command will generate output at /app/output (mount host output folder when running)
CMD bin/arduino-cli compile -b esp32:esp32:esp32 --board-options FlashMode=dio --build-path /app/output platform/esp32
# CMD bash
