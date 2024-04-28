const PORT = process.env.PORT || 8081;
const BASE_URL = process.env.BASE_URL;

if (!BASE_URL) {
    console.error("Error: BASE_URL environment variable is not defined.");
    process.exit(1);
}

const CAS_SERVER = 'https://secure.its.yale.edu'
const CAS_LOGIN_ROUTE = '/cas/login'
const CAS_SERVICE = `http://${BASE_URL}:${PORT}/api/auth/redirect`

export const get_cas_link = () => {
    const reqURL = new URL(CAS_LOGIN_ROUTE, CAS_SERVER)
    reqURL.searchParams.append('service', CAS_SERVICE)
    return reqURL.toString()
}

