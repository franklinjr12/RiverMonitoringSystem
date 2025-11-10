class AdminController < ApplicationController
  skip_before_action :authenticate_user
  before_action :require_admin_access
  layout 'admin'
  
  private
  
  def require_admin_access
    unless admin_user_signed_in?
      redirect_to admin_login_path
    end
  end
  
  def admin_user_signed_in?
    session[:admin_user_id].present? && admin_user&.email&.include?('admin')
  end
  
  def admin_user
    @admin_user ||= User.find_by(id: session[:admin_user_id]) if session[:admin_user_id]
  end
  
  def sign_in_admin(user)
    session[:admin_user_id] = user.id
  end
  
  def sign_out_admin
    session[:admin_user_id] = nil
  end
  
  helper_method :admin_user, :admin_user_signed_in?
end

