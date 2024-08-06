class Sensor < ApplicationRecord
    belongs_to :device
    has_many :sensor_data
end
