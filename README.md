# YaleClubs

YaleClubs, in collaboration with YaleConnects, provides Yale students with a user-friendly platform to explore, rank, and leave reviews for various clubs, fostering a vibrant community of club enthusiasts.

### Setup
Run ```npm install``` for both client and server

Go to `https://yalies.io/apidocs` to get an API key

Create a `.env` file in the client subfolder. Add the API key into the file as follows:
```
API_KEY=<YOUR_API_KEY>
```

Create a `.env` file in the server subfolder. Add the API link into the file as follows:
```
MONGODB_URI=<YOUR_URI_KEY>
```

To launch, first, open ./server folder

Run ```node server```

Only after that, launch by returning back to the base folder

Run ```npx expo start```

Accept another PORT configurations (Y/n)


### Style
To get theme data:
```
const theme = useContext(ThemeContext);
```