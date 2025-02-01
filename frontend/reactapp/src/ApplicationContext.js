
//couldn't make doenv to work so dealing with this for now
export function getContext() {
    const environment = process.env.NODE_ENV;
    if(environment === 'development') {
        return {
            BACKEND_HOST: 'http://localhost:3000'
        }
    } else if(environment === 'production') {
        console.log('Production environment')
    }
    return {}
}
