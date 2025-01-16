class SensorDataIngestionService
  def initialize(sensor_data)
    @sensor_data = sensor_data
    sensor_ids = sensor_data.map { |data| data[:sensor_id] }
    devices = Sensor.where(id: sensor_ids).distinct.pluck(:device_id)
    @alarms = Alarm.where(device_id: devices)
  end

  def call
    @sensor_data.each do |data|
      SensorDatum.create(sensor_id: data[:sensor_id], value: data[:value], recorded_at: data[:recorded_at])
      @alarms.each do |alarm|
        if alarm.condition_type == data[:type] && alarm.trigger(data[:value])
          NotificationService.send_notification(alarm)
        end
      end
    end
  end
end