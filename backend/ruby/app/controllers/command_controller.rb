class CommandController < ApplicationController
    
  skip_before_action :authenticate_user
  before_action :set_cors_headers

  def index
    if params[:device_id].present?
        commands = Command.where(device_id: params[:device_id]).joins(:device).where(device: { user: current_user })
        payload = commands.map do |command|
            {
                command_type: command.command_type,
                parameters: command.parameters,
            }
        end
        render json: payload
    else
        render json: { error: "No device_id provided" }, status: :bad_request
    end
  end

  private

  def set_cors_headers
    response.set_header('Access-Control-Allow-Origin', '*')
  end
end