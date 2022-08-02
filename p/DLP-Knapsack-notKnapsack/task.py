#!/usr/bin/python3
# -*- coding: utf-8 -*-
import random

from Crypto.Util.number import bytes_to_long
from secret import FLAG

assert FLAG.startswith(b'flag{') and FLAG.endswith(b'}')

q = 210767327475911131359308665806489575328083

flag_bin = bin(bytes_to_long(FLAG[5:-1]))[2:]
l = len(flag_bin)

n = random.randint(l, 2*l)
cipher = []
for _ in range(n):
    r = [random.randint(2, q-2) for _ in range(l)]
    s = 1
    for i in range(l):
        s = s * r[i] ** int(flag_bin[i]) % q
    cipher.append([r, s])

with open('output.txt', 'w') as f:
    f.write(str(cipher))
