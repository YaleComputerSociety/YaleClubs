# YaleClubs
A user-friendly platform to explore, rank, and leave reviews for various clubs, fostering a vibrant community of club enthusiasts.

# Environment Variables
Client folder:
```
# need to prefix with EXPO_PUBLIC to be able to access
EXPO_PUBLIC_BASE_URL=localhost
EXPO_PUBLIC_PORT=8081
```

Server folder:
```
BASE_URL=<url of server>
PORT=<port>
API_KEY=<key for yalies.io API>
MONGODB_URI=<mongodb URI>
DEV_ENV=<false if production else true> # used to enable/disable proxy between expo and backend
```