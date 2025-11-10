class Admin::SensorsController < AdminController
  def index
    @sensors = Sensor.includes(:device).all.order(created_at: :desc)
  end
  
  def show
    @sensor = Sensor.find(params[:id])
  end
  
  def new
    @sensor = Sensor.new
    @devices = Device.all.order(:name)
  end
  
  def create
    @sensor = Sensor.new(sensor_params)
    @devices = Device.all.order(:name)
    if @sensor.save
      redirect_to admin_sensors_path, notice: 'Sensor created successfully.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
    @sensor = Sensor.find(params[:id])
    @devices = Device.all.order(:name)
  end
  
  def update
    @sensor = Sensor.find(params[:id])
    @devices = Device.all.order(:name)
    if @sensor.update(sensor_params)
      redirect_to admin_sensors_path, notice: 'Sensor updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    @sensor = Sensor.find(params[:id])
    @sensor.destroy
    redirect_to admin_sensors_path, notice: 'Sensor deleted successfully.'
  end
  
  private
  
  def sensor_params
    params.require(:sensor).permit(:device_id, :sensor_type)
  end
end

