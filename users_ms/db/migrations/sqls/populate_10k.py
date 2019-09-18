import random
import string

def randomStringwithDigitsAndSymbols(stringLength=10):
    """Generate a random string of letters, digits and special characters """
    password_characters = string.ascii_letters + string.digits
    return ''.join(random.choice(password_characters) for i in range(stringLength))

# Declare string lengths
maxLen = 15
minLen = 7

# Declare boundaries in coords
maxCoorLon = 121.1
minCoorLon = 121
maxCoorLat = 14.55
minCoorLat = 14.51

# Open/create file in write mode
f = open('20190813071741-create-index-up.sql','a+')

uid = randomStringwithDigitsAndSymbols(random.randint(minLen, maxLen))

f.write("CALL CreateUser('{id}','{name}','{email}','{password}',1);\n".format(id=uid, name="test", email="test@test", password="test"))

# Create 50,000 Reports inside bounds with random values
for i in range(600):
    # Generate random string as ID
    rid = randomStringwithDigitsAndSymbols(random.randint(minLen, maxLen))

    # Generate random coordinates
    lat = str(random.uniform(minCoorLat, maxCoorLat))
    lon = str(random.uniform(minCoorLon, maxCoorLon))

    # Generate random type
    rType = str(random.randint(0,8))

    # Write SQL statement to file
    f.write("CALL CreateReport('{id}',{type},'{lon}','{lat}');\n".format(id=rid, type=rType, lon=lon, lat=lat))

    # Create 100 comments every report
    for j in range(45):
        # Generate random strings
        cid = randomStringwithDigitsAndSymbols(random.randint(minLen, maxLen))
        msg = randomStringwithDigitsAndSymbols(random.randint(minLen, maxLen))

        f.write("CALL CreateComment('{id}','{uid}','{name}','{rid}','{body}');\n".format(id=cid, uid=uid, name="test", rid=rid, body=msg))

# Create 50,000 Ads inside bounds with random values
for i in range(1000):
    # Generate random string as ID
    aid = randomStringwithDigitsAndSymbols(random.randint(minLen, maxLen))    

    # Generate random coordinates
    lat = str(random.uniform(minCoorLat, maxCoorLat))
    lon = str(random.uniform(minCoorLon, maxCoorLon))

    # Write SQL statement to file
    f.write("CALL CreateAd('{id}','{lon}','{lat}');\n".format(id=aid, lon=lon, lat=lat))

f.close()