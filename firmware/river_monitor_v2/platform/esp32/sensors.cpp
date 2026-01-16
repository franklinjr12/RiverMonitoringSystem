#include "sensor_interface.h"
#include "BMP280_DEV.h"

#include <Arduino.h>

#define PIN_TRIG 13
#define PIN_ECHO 14
#define PIN_ONOFF 27
#define PIN_BARCS 22

static unsigned long time1 = 0;
static unsigned long time2 = 0;
static bool b_ready = false;

SPIClass SPI1(VSPI);
BMP280_DEV bmp280(PIN_BARCS, VSPI, SPI1);

ICACHE_RAM_ATTR void isr_echo(void)
{
  if (time1 > 0)
  {
    time2 = micros();
    b_ready = true;
  }
  else
  {
    time1 = micros();
  }
}

float read_distance_mm(void)
{
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  const unsigned long timeout = 1000;
  const unsigned long t1 = millis();
  unsigned long t2 = millis();
  while ((b_ready == false) && (t2 - t1 < timeout))
    t2 = millis();
  b_ready = false;
  float dt = time2 - time1;
  float dmm = dt / 5.8;
  time1 = 0;
  if (t2 - t1 > timeout)
    return 0;
  if (dmm > 7000)
    return 0;
  return dmm;
}

int init_level_sensor(){
  pinMode(PIN_ONOFF, OUTPUT);
  digitalWrite(PIN_ONOFF, LOW);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
  attachInterrupt(digitalPinToInterrupt(PIN_ECHO), isr_echo, CHANGE);
  return 0;
}

int read_level_sensor(float* out){
  digitalWrite(PIN_ONOFF, HIGH);
  float distance_mm_value = read_distance_mm();
  digitalWrite(PIN_ONOFF, LOW);
  *out = distance_mm_value / 1000.0;
  return 0;
}

int init_temperature_sensor(){
  bmp280.begin();
  bmp280.setTimeStandby(TIME_STANDBY_1000MS);
  bmp280.startNormalConversion();
  return 0;
}

int read_temperature_sensor(float* out){
  float temperature = 0;
  float pressure = 0;
  float altitude = 0;
  while (bmp280.getMeasurements(temperature, pressure, altitude) == false)
    delay(100);
  *out = temperature;
  return 0;
}    
