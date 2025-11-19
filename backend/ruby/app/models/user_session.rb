class UserSession < ApplicationRecord
  belongs_to :user

  if ENV['LAMBDA'] == 'ON'
    after_create :schedule_delete
  end

  SESSION_TIMEOUT = 8.hours

  def schedule_delete
    DeleteUserSessionJob.set(wait: SESSION_TIMEOUT).perform_later(id)
  end

  def self.find_by_with_timeout(**args)
    record = find_by(**args)
    return nil unless record

    if record.created_at < SESSION_TIMEOUT.ago
      record.destroy
      nil
    else
      record
    end
  end
end
