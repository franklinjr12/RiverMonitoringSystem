class ApplicationController < ActionController::Base
  before_action :authenticate_user

  def authenticate_user
    token = request.headers['Authorization']
    if token.present?
      user_session = UserSession.find_by(session_token: token)
      if user_session
        @current_user = user_session.user
      else
        render json: { error: 'Invalid session token' }, status: :unauthorized
      end
    else
      render json: { error: 'Missing session token' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
