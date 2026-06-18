import urllib.request
import json

url = "http://localhost:8000/api/auth/register/"
data = {
    "email": "piyu5@gmail.com",
    "password": "Test1234!",
    "display_name": "piyush"
}
params = json.dumps(data).encode('utf8')
req = urllib.request.Request(url, data=params, headers={'content-type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as f:
        print(f"Status: {f.status}")
        print(f"Body: {f.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        print(f"Error Body: {e.read().decode('utf-8')}")
