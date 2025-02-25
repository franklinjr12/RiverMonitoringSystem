class UserSession < ApplicationRecord
  belongs_to :user

  after_create :schedule_delete

  SESSION_TIMEOUT = 8.hours

  def schedule_delete
    DeleteUserSessionJob.set(wait: SESSION_TIMEOUT).perform_later(id)
  end
end
