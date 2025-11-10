class Admin::CommandsController < AdminController
  def index
    @commands = Command.includes(:device).all.order(created_at: :desc)
  end
  
  def show
    @command = Command.find(params[:id])
  end
  
  def new
    @command = Command.new
    @devices = Device.all.order(:name)
  end
  
  def create
    @command = Command.new(command_params.except(:parameters))
    @devices = Device.all.order(:name)
    parse_parameters_json
    if @command.save
      redirect_to admin_commands_path, notice: 'Command created successfully.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
    @command = Command.find(params[:id])
    @devices = Device.all.order(:name)
  end
  
  def update
    @command = Command.find(params[:id])
    @devices = Device.all.order(:name)
    @command.assign_attributes(command_params.except(:parameters))
    parse_parameters_json
    if @command.save
      redirect_to admin_commands_path, notice: 'Command updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    @command = Command.find(params[:id])
    @command.destroy
    redirect_to admin_commands_path, notice: 'Command deleted successfully.'
  end
  
  private
  
  def command_params
    params.require(:command).permit(:device_id, :command_type, :parameters)
  end
  
  def parse_parameters_json
    if params[:command][:parameters].present? && params[:command][:parameters].strip.present?
      begin
        @command.parameters = JSON.parse(params[:command][:parameters])
      rescue JSON::ParserError => e
        @command.errors.add(:parameters, "is not valid JSON: #{e.message}")
      end
    elsif params[:command][:parameters].present? && params[:command][:parameters].strip.empty?
      @command.parameters = nil
    end
  end
end

