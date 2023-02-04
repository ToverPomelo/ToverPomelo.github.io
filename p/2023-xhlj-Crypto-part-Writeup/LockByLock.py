from Crypto.Util.number import *
from gmpy2 import *
import random
from secret import flag

class Lock:
    def __init__(self, p, q) -> None:
        while True:
            self.p = p
            self.q = q
            self.n = self.p * self.q
            self.e = random.randint(10**14, 10**15)
            
            if gcd(self.e, (self.p-1)*(self.q-1)) == 1:
                self.d = invert(self.e, (self.p-1)*(self.q-1))
                break
    
    def lock(self, message: int) -> int:
        assert 1 < message < self.n
        return powmod(message, self.e, self.n)
    
    def unlock(self, cipher: int) -> int:
        assert 1 < cipher < self.n
        return powmod(cipher, self.d, self.n)


def secureProcedure(A, B):
    global flag
    flag = bytes_to_long(flag)
    print('Alice: lock lock lock lock unlock')
    msg1 = A.lock(flag)
    print(f'Alice: locked msg1 = {msg1}')
    print('Alice: lock lock lock lock')
    
    print('Bob: lock unlock lock lock')
    msg2 = B.lock(msg1)
    print(f'Bob: locked msg2 = {msg2}')
    print('Bob: lock lock lock lock')
    
    print('Alice: unlock unlock unlock...')
    msg3 = A.unlock(msg2)
    print(f'Alice: unlocked msg3 = {msg3}')
    print('Alice: lock lock lock lock')
    
    print('Bob: unlock unlock unlock...')
    msg = B.unlock(msg3)
    
    assert msg == flag
    print('Bob: lock lock unlock')
    print('Bob: lock by lock, lock lock right, unlock unlock unlock...')
    print('Alice: right right, lock lock unlock')
    print('Bob: lock lock lock, flag lock lock lock.')
    print('Alice: lock unlock lock lock, unlock lock lock')
    print('Bob: lock lock!')
    
    
def proxyProcedure(A, B):
    print('Agent: lock lock, lock lock lock, unlock lock lock right')
    print('Alice: lock!')
    print('Bob: lock lock, unlock lock!')
    omsg = int(input())
    
    print('Alice: lock lock lock lock unlock')
    msg1 = A.lock(omsg)
    print(f'Alice: locked msg1 = {msg1}')
    print('Alice: lock lock lock lock')
    
    print('Bob: lock unlock lock lock')
    msg2 = B.lock(msg1)
    print(f'Bob: locked msg2 = {msg2}')
    print('Bob: lock lock lock lock')
    
    print('Alice: unlock unlock unlock...')
    msg3 = A.unlock(msg2)
    print(f'Alice: unlocked msg3 = {msg3}')
    print('Alice: lock lock lock lock')
    
    print('Bob: unlock unlock unlock...')
    msg = B.unlock(msg3)
    
    
    assert msg == omsg
    print('Bob: lock, lock, locked lock lock lock unlock')
    print('Bob: lock by lock, lock lock right, lock unlock unlock unlock...')
    print('Alice: right right, locked lock lock lock unlock')
    print('Bob: lock lock!')
    

def main():
    p = getPrime(1024)
    q = getPrime(1024)
    AliceLock = Lock(p, q)
    BobLock = Lock(p, q)
    
    secureProcedure(AliceLock, BobLock)
    
    try:
        proxyProcedure(AliceLock, BobLock)
        proxyProcedure(AliceLock, BobLock)
        print('Lock: lock lock lock, unlock lock lock lock, lock lock unlock lock unlock lock, lock.')
    except Exception:
        print('lock unlock, lock locked, unlocked lock')


if __name__ == '__main__':
    main()