def is_prime(number)
  return false if number <= 1
  (2..Math.sqrt(number)).none? { |i| number % i == 0 }
end

(2..10).each do |num|
  puts num if is_prime(num)
end