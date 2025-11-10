class Admin::DevicesController < AdminController
  def index
    @devices = Device.includes(:user).all.order(created_at: :desc)
  end
  
  def show
    @device = Device.find(params[:id])
  end
  
  def new
    @device = Device.new
    @users = User.all.order(:email)
  end
  
  def create
    @device = Device.new(device_params)
    @users = User.all.order(:email)
    parse_configuration_json
    if @device.save
      redirect_to admin_devices_path, notice: 'Device created successfully.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
    @device = Device.find(params[:id])
    @users = User.all.order(:email)
  end
  
  def update
    @device = Device.find(params[:id])
    @users = User.all.order(:email)
    @device.assign_attributes(device_params.except(:configuration))
    parse_configuration_json
    if @device.save
      redirect_to admin_devices_path, notice: 'Device updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    @device = Device.find(params[:id])
    @device.destroy
    redirect_to admin_devices_path, notice: 'Device deleted successfully.'
  end
  
  private
  
  def device_params
    params.require(:device).permit(:name, :user_id, :location, :configuration)
  end
  
  def parse_configuration_json
    if params[:device][:configuration].present? && params[:device][:configuration].strip.present?
      begin
        @device.configuration = JSON.parse(params[:device][:configuration])
      rescue JSON::ParserError => e
        @device.errors.add(:configuration, "is not valid JSON: #{e.message}")
      end
    elsif params[:device][:configuration].present? && params[:device][:configuration].strip.empty?
      @device.configuration = nil
    end
  end
end

