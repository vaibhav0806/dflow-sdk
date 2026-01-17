import { MarketsAPI } from '../src/api/metadata/markets';
import {  } from '../src/api/metadata/tags';
import { HttpClient } from '../src/utils/http';

let url = 'https://dev-prediction-markets-api.dflow.net/api/v1';

const http = new HttpClient({
    baseUrl: url,
});

const marketsAPI = new MarketsAPI(http);


marketsAPI.getMarkets({
    status: 'active',
    sort: 'openInterest',
    limit: 3,
}).then((response) => {
    console.log(response);
});
