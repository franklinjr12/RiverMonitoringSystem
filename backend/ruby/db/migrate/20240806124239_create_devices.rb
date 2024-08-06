class CreateDevices < ActiveRecord::Migration[7.1]
  def change
    create_table :devices do |t|
      t.string :name, null: false
      t.references :user, null: false, foreign_key: true
      t.string :location

      t.timestamps
    end
  end
end
