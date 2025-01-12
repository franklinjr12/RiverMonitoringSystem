class AddConfigurationToDevices < ActiveRecord::Migration[7.1]
  def change
    add_column :devices, :configuration, :jsonb
  end
end
