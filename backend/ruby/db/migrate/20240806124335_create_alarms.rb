class CreateAlarms < ActiveRecord::Migration[7.1]
  def change
    create_table :alarms do |t|
      t.references :device, null: false, foreign_key: true
      t.string :trigger_condition, null: false
      t.string :notification_endpoint, null: false

      t.timestamps
    end
  end
end
