# YaleClubs

YaleClubs, in collaboration with YaleConnects, provides Yale students with a user-friendly platform to explore, rank, and leave reviews for various clubs, fostering a vibrant community of club enthusiasts.

### Setup
Run ```npm install```

Go to `https://yalies.io/apidocs` to get an API key

Create a `.env` file. Add the API key into the file as follows:
```
API_KEY=<YOUR_API_KEY>
```

To launch, run ```npx expo start```

### Style
To get theme data:
```
const theme = useContext(ThemeContext);
```