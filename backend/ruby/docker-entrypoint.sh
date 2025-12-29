#!/bin/bash -e

cd /rails

# Fix Windows line endings in bin files if they exist
if [ -d bin ]; then
  for file in bin/*; do
    if [ -f "$file" ] && [ -w "$file" ]; then
      tr -d "\r" < "$file" > "$file.tmp" && mv "$file.tmp" "$file" 2>/dev/null || true
      sed -i "s/ruby\.exe/ruby/g" "$file" 2>/dev/null || true
      chmod +x "$file" 2>/dev/null || true
    fi
  done
fi

# If running the rails server then create or migrate existing database
if [ "${1}" == "./bin/rails" ] && [ "${2}" == "server" ]; then
  ./bin/rails db:prepare
fi

exec "${@}"

