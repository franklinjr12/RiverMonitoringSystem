class NotificationService
  def self.send_notification(alarm)
    user = alarm.device.user
    message = "Alarm triggered for device #{alarm.device.name} at time #{Time.current.utc}"
    puts "Sending notification to #{user.email} with message: #{message}"
  end
end