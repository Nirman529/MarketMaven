import { combineReducers } from "redux";
import portfolioReducer from "./portfolio";
import watchlistReducer from "./watchlistReducer";
import stocksReducer from "./stocks";

export const rootReducer = combineReducers({
    watchlist: watchlistReducer,
    stocks: stocksReducer,
    portfolio: portfolioReducer,
})