class CreateSensorData < ActiveRecord::Migration[7.1]
  def change
    create_table :sensor_data do |t|
      t.references :sensor, null: false, foreign_key: true
      t.float :value, null: false
      t.datetime :recorded_at, null: false

      t.timestamps
    end
  end
end
