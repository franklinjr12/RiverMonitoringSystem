#ifndef SENSOR_DATA_HPP
#define SENSOR_DATA_HPP

#include <vector>
#include <ctime>
#include <string>

struct SensorData {
    time_t recordedAt;
    int sensorId;
    float value;
};

extern std::vector<SensorData> sensorDataList;

void collectSensorData();
std::string formatSensorDataToJson();

#endif // SENSOR_DATA_HPP