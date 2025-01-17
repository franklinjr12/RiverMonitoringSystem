require 'net/http'

class NotificationService
  def self.send_notification(alarm)
    device = alarm.device
    user = device.user
    Rails.logger.info("Alarm #{alarm.id} triggered for device id:#{device.id} name:#{device.name} at time #{Time.current.utc}")
    payload = {
      user: user.email,
      device: device.name,
      location: device.location,
      device_id: device.id,
      alarm_id: alarm.id,
      sent_at: Time.current.utc
    }
    begin
      uri = URI(alarm.notification_endpoint)
      req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
      req.body = payload.to_json
      res = Net::HTTP.start(uri.hostname, uri.port) do |http|
        http.request(req)
      end
      Rails.logger.info("Notification sent with response code: #{res.code}")
    rescue StandardError => e
      Rails.logger.error("Error sending notification: #{e.message}")
    end
  end
end