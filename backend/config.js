const PORT = process.env.PORT || 8080;
const mongoDBURL = "mongodb+srv://nirmanmalaviya529:XeAxDzhxdawRVo6f@stock-market-proj3.7qgjnfv.mongodb.net/?retryWrites=true&w=majority&appName=stock-market-proj3"
const _FIN_KEY = "co1nnr1r01qgulhrbsu0co1nnr1r01qgulhrbsug" // old 
const FIN_KEY = "co1nnghr01qgulhrbso0co1nnghr01qgulhrbsog" // new 
const _POLY_KEY = "PPaplDXV2tTrwcD231krLGxzgLugWXsc" // old 
const POLY_KEY = "bgm0wXv0sdUgkaTe7g0DEtLRX6D6doen" // new
module.exports = { PORT, mongoDBURL, _FIN_KEY, FIN_KEY, _POLY_KEY, POLY_KEY };