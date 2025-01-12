# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_01_12_144512) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "alarms", force: :cascade do |t|
    t.bigint "device_id", null: false
    t.string "trigger_condition", null: false
    t.string "notification_endpoint", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_alarms_on_device_id"
  end

  create_table "commands", force: :cascade do |t|
    t.bigint "device_id", null: false
    t.string "command_type", null: false
    t.json "parameters", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_commands_on_device_id"
  end

  create_table "devices", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "user_id", null: false
    t.string "location"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "configuration"
    t.index ["user_id"], name: "index_devices_on_user_id"
  end

  create_table "sensor_data", force: :cascade do |t|
    t.bigint "sensor_id", null: false
    t.float "value", null: false
    t.datetime "recorded_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sensor_id"], name: "index_sensor_data_on_sensor_id"
  end

  create_table "sensors", force: :cascade do |t|
    t.bigint "device_id", null: false
    t.string "sensor_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_sensors_on_device_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "alarms", "devices"
  add_foreign_key "commands", "devices"
  add_foreign_key "devices", "users"
  add_foreign_key "sensor_data", "sensors"
  add_foreign_key "sensors", "devices"
end
