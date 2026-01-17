import { MarketsAPI } from '../src/api/metadata/markets';
import { TagsAPI } from '../src/api/metadata/tags';
import { EventsAPI } from '../src/api/metadata/events';
import { SearchAPI } from '../src/api/metadata/search';
import { SeriesAPI } from '../src/api/metadata/series';
import { HttpClient } from '../src/utils/http';

let url = 'https://dev-prediction-markets-api.dflow.net/api/v1';

const http = new HttpClient({
    baseUrl: url,
});

const marketsAPI = new MarketsAPI(http);
const tagsAPI = new TagsAPI(http);
const eventsAPI = new EventsAPI(http);
const searchAPI = new SearchAPI(http);
const seriesAPI = new SeriesAPI(http);

// seriesAPI.getSeries({
//     category: 'Sports',
//     status: 'active',
//     isInitialized: true,
//     tags: 'Football'
// }).then((response) => {
//     console.log(response);
// })

// eventsAPI.getEvent('KXFEDDECISION-26JAN', true).then((response) => {
//     console.log(response);
//     // console.log('markets are: ', response.markets);
// })

// eventsAPI.getEvents({
//     limit: 1,
//     sort: 'volume24h',
//     withNestedMarkets: true
// }).then((response) => {
//     console.log(response);
//     console.log('markets are: ', response.events[0].markets);
// })

// eventsAPI.getEventCandlesticks('KXSB-26', {
//     startTs: Math.floor(Date.now() / 1000) - 5 * 60 * 60,
//     endTs: Math.floor(Date.now() / 1000),
//     periodInterval: 60,
// }).then((response) => {
//     console.log('Candlesticks response:', JSON.stringify(response, null, 2));
// }).catch((error) => {
//     console.error('Error fetching candlesticks:', error);
// });

// tagsAPI.getTagsByCategories().then((response) => {
//     console.log(response);
// })

// marketsAPI.getMarkets({
//     status: 'active',
//     sort: 'openInterest',
//     limit: 1,
// }).then((response) => {
//     console.log(response);
// });
