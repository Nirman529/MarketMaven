import { GET_PORTFOLIO } from "../type/portfolio.js";

const initialState = {
    portfolio: [],
}

const portfolioReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_PORTFOLIO: {
            return { ...state, portfolio: action.payload };
        }
        default:
            return state;
    }
}

export default portfolioReducer;