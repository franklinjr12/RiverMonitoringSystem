if Rails.application.credentials.secret_key_base.present?
  Rails.logger.info "Master key loaded successfully."
else
  Rails.logger.error "Master key not loaded."
end

Rails.logger.info "Secret key base: #{Rails.application.credentials.secret_key_base}"