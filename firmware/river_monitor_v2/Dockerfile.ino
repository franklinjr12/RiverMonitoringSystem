# build with
# docker build -f Dockerfile.ino -t river_monitor_v2 .
# run with
# docker run -it river_monitor_v2

FROM ubuntu:latest

WORKDIR /app

RUN apt update && apt upgrade -y

RUN apt install -y curl

RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

CMD bash