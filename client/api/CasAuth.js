const CAS_SERVER = 'https://secure.its.yale.edu'
const CAS_LOGIN_ROUTE = '/cas/login'
const CAS_SERVICE = `https://yaleclubsapi.vercel.app/api/auth/redirect`

export const get_cas_link = () => {
    const reqURL = new URL(CAS_LOGIN_ROUTE, CAS_SERVER)
    reqURL.searchParams.append('service', CAS_SERVICE)
    return reqURL.toString()
}

