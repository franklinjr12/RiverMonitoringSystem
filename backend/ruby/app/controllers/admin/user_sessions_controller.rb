class Admin::UserSessionsController < AdminController
  def index
    @user_sessions = UserSession.includes(:user).all.order(created_at: :desc)
  end
  
  def show
    @user_session = UserSession.find(params[:id])
  end
  
  def new
    @user_session = UserSession.new
    @users = User.all.order(:email)
  end
  
  def create
    @user_session = UserSession.new(user_session_params)
    @users = User.all.order(:email)
    @user_session.session_token ||= SecureRandom.hex(8)
    if @user_session.save
      redirect_to admin_user_sessions_path, notice: 'User session created successfully.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
    @user_session = UserSession.find(params[:id])
    @users = User.all.order(:email)
  end
  
  def update
    @user_session = UserSession.find(params[:id])
    @users = User.all.order(:email)
    if @user_session.update(user_session_params)
      redirect_to admin_user_sessions_path, notice: 'User session updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    @user_session = UserSession.find(params[:id])
    @user_session.destroy
    redirect_to admin_user_sessions_path, notice: 'User session deleted successfully.'
  end
  
  private
  
  def user_session_params
    params.require(:user_session).permit(:user_id, :session_token)
  end
end

