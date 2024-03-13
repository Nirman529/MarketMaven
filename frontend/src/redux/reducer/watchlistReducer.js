import { GET_WATCHLIST } from '../type/watchlist.js';

const initialState = {
    count: 0,
    stocks: [],
}

const watchlistReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_WATCHLIST: {

            return { ...state, stocks: action.payload };
        }

        default:
            return state;
    }
}

export default watchlistReducer;