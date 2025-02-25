class DeleteUserSessionJob < ApplicationJob
  queue_as :default

  def perform(user_session_id)
    user_session = UserSession.find(user_session_id)
    user_session.destroy
  end
end