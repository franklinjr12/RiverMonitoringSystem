# runs npm build in frontend/reactapp
# copies the build folder to ./docs and copies the index.html to ./docs/404.html

require 'fileutils'

# Get the script directory and project root
script_dir = File.dirname(File.expand_path(__FILE__))
project_root = File.expand_path(File.join(script_dir, '..'))
frontend_dir = File.join(project_root, 'frontend', 'reactapp')
build_dir = File.join(frontend_dir, 'build')
docs_dir = File.join(project_root, 'docs')

# Step 1: Run npm build in frontend/reactapp
puts "Running npm build in #{frontend_dir}..."
Dir.chdir(frontend_dir) do
  unless system('npm run build')
    puts "Error: npm build failed"
    exit 1
  end
end

# Step 2: Check if build directory exists
unless Dir.exist?(build_dir)
  puts "Error: Build directory not found at #{build_dir}"
  exit 1
end

# Step 3: Clean docs directory (optional - remove if you want to preserve other files)
# FileUtils.rm_rf(docs_dir) if Dir.exist?(docs_dir)

# Step 4: Copy build folder contents to docs
puts "Copying build files to #{docs_dir}..."
FileUtils.mkdir_p(docs_dir)
FileUtils.cp_r(File.join(build_dir, '.'), docs_dir, verbose: true)

# Step 5: Copy index.html to 404.html for GitHub Pages SPA routing
index_html = File.join(docs_dir, 'index.html')
error_html = File.join(docs_dir, '404.html')

if File.exist?(index_html)
  FileUtils.cp(index_html, error_html, verbose: true)
  puts "Copied index.html to 404.html for GitHub Pages routing"
else
  puts "Warning: index.html not found in docs directory"
end

puts "Build completed successfully!"