class CreateCommands < ActiveRecord::Migration[7.1]
  def change
    create_table :commands do |t|
      t.references :device, null: false, foreign_key: true
      t.string :command_type, null: false
      t.json :parameters, null: false

      t.timestamps
    end
  end
end
