class Admin::SensorDataController < AdminController
  def index
    @sensor_data = SensorDatum.includes(:sensor).all.order(recorded_at: :desc)
  end
  
  def show
    @sensor_datum = SensorDatum.find(params[:id])
  end
  
  def new
    @sensor_datum = SensorDatum.new
    @sensors = Sensor.all.includes(:device).order('devices.name, sensors.sensor_type')
  end
  
  def create
    @sensor_datum = SensorDatum.new(sensor_datum_params)
    @sensors = Sensor.all.includes(:device).order('devices.name, sensors.sensor_type')
    if @sensor_datum.save
      redirect_to admin_sensor_data_path, notice: 'Sensor data created successfully.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
    @sensor_datum = SensorDatum.find(params[:id])
    @sensors = Sensor.all.includes(:device).order('devices.name, sensors.sensor_type')
  end
  
  def update
    @sensor_datum = SensorDatum.find(params[:id])
    @sensors = Sensor.all.includes(:device).order('devices.name, sensors.sensor_type')
    if @sensor_datum.update(sensor_datum_params)
      redirect_to admin_sensor_data_path, notice: 'Sensor data updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    @sensor_datum = SensorDatum.find(params[:id])
    @sensor_datum.destroy
    redirect_to admin_sensor_data_path, notice: 'Sensor data deleted successfully.'
  end
  
  private
  
  def sensor_datum_params
    params.require(:sensor_datum).permit(:sensor_id, :value, :recorded_at)
  end
end

