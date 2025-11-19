if ENV['LAMBDA'] == 'ON'
  ActiveSupport::Notifications.subscribe('process_action.action_controller') do |event|
    payload = event.payload
    request_id = payload[:headers]&.[]('action_dispatch.request_id') || payload[:request_id]
  
    Rails.logger.info(
      {
        source: 'river_monitoring_lambda',
        event: 'process_action',
        controller: payload[:controller],
        action: payload[:action],
        status: payload[:status],
        duration_ms: event.duration.round(2),
        db_runtime_ms: payload[:db_runtime]&.round(2),
        view_runtime_ms: payload[:view_runtime]&.round(2),
        request_id: request_id
      }.compact
    )
  end
end  
