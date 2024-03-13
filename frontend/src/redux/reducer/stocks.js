import { GET_STOCK } from "../type/stocks.js";

const initialState = {
    stocks: [],
}

const stocksReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_STOCK: {
            return { ...state, stocks: action.payload };
        }
        default:
            return state;
    }
}

export default stocksReducer;