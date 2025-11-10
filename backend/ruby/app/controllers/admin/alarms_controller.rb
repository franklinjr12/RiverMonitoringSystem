class Admin::AlarmsController < AdminController
  def index
    @alarms = Alarm.includes(:device).all.order(created_at: :desc)
  end
  
  def show
    @alarm = Alarm.find(params[:id])
  end
  
  def new
    @alarm = Alarm.new
    @devices = Device.all.order(:name)
  end
  
  def create
    @alarm = Alarm.new(alarm_params)
    @devices = Device.all.order(:name)
    if @alarm.save
      redirect_to admin_alarms_path, notice: 'Alarm created successfully.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
    @alarm = Alarm.find(params[:id])
    @devices = Device.all.order(:name)
  end
  
  def update
    @alarm = Alarm.find(params[:id])
    @devices = Device.all.order(:name)
    if @alarm.update(alarm_params)
      redirect_to admin_alarms_path, notice: 'Alarm updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    @alarm = Alarm.find(params[:id])
    @alarm.destroy
    redirect_to admin_alarms_path, notice: 'Alarm deleted successfully.'
  end
  
  private
  
  def alarm_params
    params.require(:alarm).permit(:device_id, :trigger_condition, :notification_endpoint)
  end
end

