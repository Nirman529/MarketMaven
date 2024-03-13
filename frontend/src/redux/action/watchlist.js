import axios from "axios"
import apiLink from "../../apiLink"

export const getWatchlist = () => {
    return async (dispatch) => {
        await axios.get(`${apiLink}/watchlist/get`)
            .then((response) => {
                dispatch({ type: "GET_WATCHLIST", payload: response.data.data })
            })
            .catch((error) => {
                console.log('error in getWatchlist', error)
            })
    }
}

export const addWatchlist = (obj) => {
    return async (dispatch) => {
        await axios.post(`${apiLink}/watchlist/add`, {productId: obj.ID, quantity: obj.quantity})
            .then((response) => {
                dispatch(getWatchlist())
            }).catch((error) => {
                console.log('error in addWatchlist', error)
            })
    }
}

export const deleteWatchlist = (obj) => {
    return async (dispatch) => {
        await axios.delete(`${apiLink}/watchlist/delete?productId=${obj.__id}`)
            .then((response) => {
                dispatch(getWatchlist())
            }).catch((error) => {
                console.log('error in deleteWatchlist', error)
            })
    }
}

