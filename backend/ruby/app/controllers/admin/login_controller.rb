class Admin::LoginController < ApplicationController
  skip_before_action :authenticate_user
  layout false
  
  def new
    redirect_to admin_path if admin_user_signed_in?
  end
  
  def create
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password]) && user.email.include?('admin')
      session[:admin_user_id] = user.id
      redirect_to admin_path, notice: 'Logged in successfully.'
    else
      flash[:alert] = 'Invalid email or password, or user is not an admin.'
      render :new, status: :unprocessable_entity
    end
  end
  
  def destroy
    session[:admin_user_id] = nil
    redirect_to admin_login_path, notice: 'Logged out successfully.'
  end
  
  private
  
  def admin_user_signed_in?
    session[:admin_user_id].present? && User.find_by(id: session[:admin_user_id])&.email&.include?('admin')
  end
  
  helper_method :admin_user_signed_in?
end

