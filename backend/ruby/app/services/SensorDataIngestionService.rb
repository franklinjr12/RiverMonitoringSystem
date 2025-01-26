class SensorDataIngestionService
  def initialize(sensor_data)
    @sensor_data = sensor_data
    sensor_ids = sensor_data.map { |data| data[:sensor_id] }
    sensors = Sensor.where(id: sensor_ids).distinct
    @sensor_type_hash = sensors.pluck(:id, :sensor_type).to_h
    device_ids = sensors.pluck(:device_id)
    @alarms = Alarm.where(device_id: device_ids)
  end

  def call
    @sensor_data.each do |data|
      SensorDatum.create(sensor_id: data[:sensor_id], value: data[:value], recorded_at: data[:recorded_at] || Time.now)
      @alarms.each do |alarm|
        if alarm.condition_type == @sensor_type_hash[data[:sensor_id].to_i] && alarm.trigger(data[:value].to_i)
          NotificationService.send_notification(alarm)
        end
      end
    end
  end
end