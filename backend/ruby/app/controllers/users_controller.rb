class UsersController < ApplicationController
    # ignores authentication for now
    skip_before_action :verify_authenticity_token

  def create
    user = User.new(user_params)
    if user.save
      render json: user, status: :created
    else
      render json: user.errors, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: user_params[:username])
    if user && user.authenticate(user_params[:password])
      render json: {id: user.id}, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :password)
  end
  
end