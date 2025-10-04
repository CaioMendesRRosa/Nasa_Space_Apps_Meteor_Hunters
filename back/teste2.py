import math

h = 8000
p0 = 1
Cd = 2
v0 = 11.24 * 1000
meteorDensity = 2600
meteorDiameter = 37
Yi = 194441.147979
If = 7.014035849774133e-06

print ("AAAA " + str(meteorDiameter * 7))

print(math.pow(10, 2.107 + 0.0624 * math.sqrt(meteorDensity)))

print( 4.07 * ( Cd * h * Yi ) / ( meteorDensity * meteorDiameter * v0 * v0 ) )

If = 4.07 * ( Cd * h * Yi ) / ( meteorDensity * meteorDiameter * v0 * v0 )

# 8.856120687403314

parte1 = math.log(Yi / (v0 * v0)) + 1.308 - 0.341 * If - 1.303 * math.sqrt(1 - If)
print(-h * parte1)

zEstrela = -h * parte1

def p(z):
    return p0 * math.exp( -z / h )

def l(z):
    return meteorDiameter * math.sqrt( (p0) / ( Cd * p(z) ) )


def L(z):
    pt2 = ( math.exp( ( zEstrela - z ) / (2 * h)) - 1 ) * ( math.exp( ( zEstrela - z ) / (2 * h)) - 1 )
    pt1 = pt2 * ( ( ( 4 * h * h ) / ( l(zEstrela) * l(zEstrela) ) ) ) + 1
    return meteorDiameter * math.sqrt(pt1)

print("salve")
print(L(0) / meteorDiameter)

fp = L(7) / meteorDiameter

print(zEstrela - (2 * h) * math.log(1 + ( ( l(zEstrela) / ( 2 * h ) ) * math.sqrt(fp * fp - 1) ) ) )



def v(z):
    return v0 * math.exp( - ( 3 * p(z) * Cd * h ) / ( 4 * meteorDensity * meteorDiameter ) )


