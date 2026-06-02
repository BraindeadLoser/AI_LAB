import java.util.Scanner;

public class Sample {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Enter the first number:");
        double num1 = scanner.nextDouble();
        
        System.out.println("Enter the second number:");
        double num2 = scanner.nextDouble();
        
        System.out.println("Choose an operation (add, subtract, multiply, divide):");
        String operation = scanner.next();
        
        double result;
        switch (operation) {
            case "add":
                result = num1 + num2;
                break;
            case "subtract":
                result = num1 - num2;
                break;
            case "multiply":
                result = num1 * num2;
                break;
            case "divide":
                if (num2 != 0) {
                    result = num1 / num2;
                } else {
                    System.out.println("Error! Division by zero.");
                    return;
                }
                break;
            default:
                System.out.println("Invalid operation!");
                return;
        }
        
        System.out.println("Result: " + result);
    }
}