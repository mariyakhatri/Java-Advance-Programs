// AdvancedPrimes.java
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class AdvancedPrimes {

    // -------------------------
    // 1) Deterministic Miller-Rabin for 64-bit (long)
    // -------------------------
    // Deterministic bases for testing up to 2^64 from research (works for unsigned 64-bit,
    // for signed long <= 2^63-1 the same set works). Using known bases: {2,3,5,7,11,13}
    // (for 64-bit there are a few well-known small sets; this set is reliable for typical ranges).
    public static boolean isPrimeDeterministic(long n) {
        if (n < 2) return false;
        int[] smallPrimes = {2,3,5,7,11,13,17,19,23,29,31,37};
        for (int p : smallPrimes) {
            if (n == p) return true;
            if (n % p == 0) return n == p;
        }
        long d = n - 1;
        int s = 0;
        while ((d & 1) == 0) { d >>= 1; s++; }

        long[] bases = {2, 325, 9375, 28178, 450775, 9780504, 1795265022}; 
        // These bases form a deterministic set for 64-bit integers.
        for (long a : bases) {
            if (a % n == 0) continue;
            if (!millerRabinCheck(n, a, d, s)) return false;
        }
        return true;
    }

    private static boolean millerRabinCheck(long n, long a, long d, int s) {
        // compute x = a^d mod n using modular exponentiation (safe for long)
        long x = modPow(a % n, d, n);
        if (x == 1 || x == n - 1) return true;
        for (int r = 1; r < s; r++) {
            x = mulMod(x, x, n);
            if (x == n - 1) return true;
        }
        return false;
    }

    // modular multiplication (a * b) % mod using long while avoiding overflow
    private static long mulMod(long a, long b, long mod) {
        // Use BigInteger for safety and simplicity
        return BigInteger.valueOf(a).multiply(BigInteger.valueOf(b)).mod(BigInteger.valueOf(mod)).longValue();
    }

    // modular exponentiation (base^exp % mod)
    private static long modPow(long base, long exp, long mod) {
        long result = 1;
        long cur = base % mod;
        while (exp > 0) {
            if ((exp & 1) == 1) result = mulMod(result, cur, mod);
            cur = mulMod(cur, cur, mod);
            exp >>= 1;
        }
        return result;
    }

    // -------------------------
    // 2) Sieve of Eratosthenes - list primes up to n
    // -------------------------
    public static List<Integer> sieveEratosthenes(int n) {
        if (n < 2) return new ArrayList<>();
        boolean[] isPrime = new boolean[n + 1];
        Arrays.fill(isPrime, true);
        isPrime[0] = isPrime[1] = false;
        int limit = (int)Math.sqrt(n);
        for (int p = 2; p <= limit; p++) {
            if (isPrime[p]) {
                for (int multiple = p * p; multiple <= n; multiple += p) {
                    isPrime[multiple] = false;
                }
            }
        }
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) if (isPrime[i]) primes.add(i);
        return primes;
    }

    // -------------------------
    // 3) Segmented Sieve - primes in [L, R]
    // Works even if R > memory for direct sieve; R-L should be reasonable (e.g., <= 10^7)
    // -------------------------
    public static List<Long> segmentedSieve(long L, long R) {
        if (R < 2 || L > R) return new ArrayList<>();
        long limit = (long)Math.sqrt(R) + 1;
        List<Integer> basePrimes = sieveEratosthenes((int)limit);
        int size = (int)(R - L + 1);
        boolean[] isPrime = new boolean[size];
        Arrays.fill(isPrime, true);

        for (int p : basePrimes) {
            long start = Math.max((long)p * p, ((L + p - 1) / p) * (long)p);
            for (long j = start; j <= R; j += p) {
                isPrime[(int)(j - L)] = false;
            }
        }
        List<Long> primes = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            long num = L + i;
            if (isPrime[i] && num >= 2) primes.add(num);
        }
        return primes;
    }

    // -------------------------
    // Demo main
    // -------------------------
    public static void main(String[] args) {
        // 1) Test isPrimeDeterministic
        long test = 9223372036854775783L; // large odd number example (change as needed)
        System.out.println("isPrime(" + test + ") = " + isPrimeDeterministic(test));

        // 2) Sieve up to n
        int n = 100;
        List<Integer> primesToN = sieveEratosthenes(n);
        System.out.println("Primes up to " + n + ": " + primesToN);

        // 3) Segmented sieve in [L, R]
        long L = 1_000_000_000L, R = 1_000_000_200L; // example range
        List<Long> primesInRange = segmentedSieve(L, R);
        System.out.println("Primes in [" + L + "," + R + "]: " + primesInRange);
    }
}
