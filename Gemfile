source "https://rubygems.org"

# Use GitHub Pages gem which includes Jekyll and all dependencies
gem "github-pages", "~> 228", group: :jekyll_plugins

# Required for Ruby 3.4.0+
gem "csv"
gem "base64"
gem "bigdecimal"

# Windows and JRuby compatibility
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance booster for watching directories on Windows
gem "wdm", "~> 0.1", :platforms => [:windows]

# Lock http_parser.rb gem to v0.6.x for JRuby builds
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# For serving the site locally
gem "webrick", "~> 1.8"