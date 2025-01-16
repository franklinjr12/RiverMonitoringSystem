class Alarm < ApplicationRecord
    belongs_to :device

    def trigger(income_value)
      # format of trigger_condition is: "type condition value" -> "level > 50"
      value = income_value.to_f
      condition = trigger_condition.split(' ')
      operator = condition[1]
      threshold = condition[2].to_f
      case operator
      when '>'
        value > threshold
      when '<'
        value < threshold
      when '>='
        value >= threshold
      when '<='
        value <= threshold
      when '=='
        value == threshold
      when '!='
        value != threshold
      else
        false
      end
    end

    def condition_type
        trigger_condition.split(' ')[0]
    end
end
