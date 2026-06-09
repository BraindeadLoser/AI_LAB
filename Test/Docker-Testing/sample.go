package main
import "fmt"

func main() {
    printPrimes()
}

func printPrimes() {
    for num := 2; num <= 10; num++ {
        if isPrime(num) {
            fmt.Println(num)
        }
    }
}

func isPrime(n int) bool {
    for i := 2; i*i <= n; i++ {
        if n%i == 0 {
            return false
        }
    }
    return true
}