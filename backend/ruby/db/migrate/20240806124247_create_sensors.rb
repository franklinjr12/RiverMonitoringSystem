class CreateSensors < ActiveRecord::Migration[7.1]
  def change
    create_table :sensors do |t|
      t.references :device, null: false, foreign_key: true
      t.string :sensor_type, null: false

      t.timestamps
    end
  end
end
