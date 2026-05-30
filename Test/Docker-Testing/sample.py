def find_primes_up_to_n(n):
    primes = []
    for possiblePrime in range(2, n + 1):
        isPrime = True
        for num in range(2, int(possiblePrime ** 0.5) + 1):
            if possiblePrime % num == 0:
                isPrime = False
                break
        if isPrime:
            primes.append(possiblePrime)
    return primes

def main():
    primes_up_to_1000 = find_primes_up_to_n(1000)
    for prime in primes_up_to_1000:
        print(prime)

if __name__ == "__main__":
    main()