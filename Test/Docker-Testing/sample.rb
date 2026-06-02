def greet(name)
  "Hello, #{name}!"
end

(1..10).each do |i|
  puts i
end

puts greet("World")
# This is a simple Ruby script that defines a method `greet` which takes a name as an argument and returns a greeting message. The script then calls the `greet` method with the argument "World" and prints the result. Additionally, it includes a loop that prints numbers from 1 to 10.