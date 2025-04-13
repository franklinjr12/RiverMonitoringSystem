#include "sensor_data.hpp"
#include <cstdio>
#include <ctime>

std::vector<SensorData> sensorDataList;

void collectSensorData() {
    SensorData data;
    data.recordedAt = time(nullptr);
    data.sensorId = 1;
    data.value = 1.0;
    sensorDataList.push_back(data);
}

std::string formatSensorDataToJson() {
    char buffer[256];
    std::string json = "{\"payload\":[";
    for (size_t i = 0; i < sensorDataList.size(); ++i) {
        SensorData data = sensorDataList[i];
        char timeBuffer[64];
        strftime(timeBuffer, sizeof(timeBuffer), "%FT%TZ", gmtime(&data.recordedAt));
        snprintf(buffer, sizeof(buffer), "{\"sensor_id\":%d,\"value\":%f,\"recorded_at\":\"%s\"}", data.sensorId, data.value, timeBuffer);
        json += buffer;
        if (i < sensorDataList.size() - 1) {
            json += ",";
        }
    }
    json += "]}";
    return json;
}