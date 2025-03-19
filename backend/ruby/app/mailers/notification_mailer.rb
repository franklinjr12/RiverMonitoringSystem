class NotificationMailer < ApplicationMailer
  def alarm_email(payload)
    @payload = payload
    mail(to: payload[:user], subject: "Alarm from device #{payload[:device]}-#{payload[:device_id]}")
  end
end