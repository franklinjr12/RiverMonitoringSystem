class SensorDataIngestionService
  def initialize(sensor_data)
    @sensor_data = sensor_data
  end

  def call
    @sensor_data.each do |data|
      SensorDatum.create(sensor_id: data[:sensor_id], value: data[:value], recorded_at: data[:recorded_at])
    end
  end
end