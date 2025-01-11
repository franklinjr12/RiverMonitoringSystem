Rails.application.routes.draw do
  root to: redirect('http://localhost:3001/') # Redirect to frontend for convenience
  get 'sensor_datum/index'
  get 'device/index'
  get 'alarm/index'
  # get 'alarm', to: 'alarms#index'
  post 'alarm/create'
  post 'users/login', to: 'users#login'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Handle CORS preflight requests
  # match '*path', to: 'application#handle_options', via: :options

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
