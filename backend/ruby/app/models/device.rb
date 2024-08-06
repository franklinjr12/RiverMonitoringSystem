class Device < ApplicationRecord
    belongs_to :user
    has_many :sensors
    has_many :commands
    has_many :alarms
end
