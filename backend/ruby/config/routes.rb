Rails.application.routes.draw do
  root to: redirect('http://localhost:3001/') # Redirect to frontend for convenience
  get 'sensor_datum/index'
  post 'sensor_datum/create'
  get 'device/index'
  get 'alarm/index'
  get 'device_configuration/index'
  post 'device_configuration/create'
  post 'alarm/create'
  post 'users/login', to: 'users#login'
  get 'command/index'
  get 'demo/index'
  get 'demo/create_sensor_data'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
