const initState = {
  auth: {
    token: '',
    userId: ''
  },
  leaderboard: [],
  subscribed: [],
  tracking: [],
  overviewInitialized: false
};

const usersReducer = (state = initState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, auth: { ...action.auth } };

    case 'LOGOUT':
      return { ...state, auth: initState.auth };

    case 'SET_LEADERBOARD':
      return { ...state, leaderboard: action.users };

    case 'FORCE_ADD_SUBSCRIBED':
      return { ...state, subscribed: state.subscribed.concat(action.user) };

    case 'ADD_SUBSCRIBED':
      if (!state.subscribed.find((user) => user.id === action.user.id))
        return { ...state, subscribed: state.subscribed.concat(action.user) };
      return state;

    case 'UPDATE_SUBSCRIBED':
      return {
        ...state,
        subscribed: state.subscribed.map((user) => {
          if (user.id === action.user.id) {
            return action.user;
          }
          return user;
        })
      };

    case 'REMOVE_SUBSCRIBED':
      return {
        ...state,
        subscribed: state.subscribed.filter((user) => user.id !== action.id)
      };

    case 'FORCE_ADD_TRACKING':
      return { ...state, tracking: state.tracking.concat(action.tracking) };

    case 'ADD_TRACKING':
      if (
        !state.tracking.find((stock) => stock.symbol === action.tracking.symbol)
      )
        return { ...state, tracking: state.tracking.concat(action.tracking) };
      return state;

    case 'UPDATE_TRACKING':
      return {
        ...state,
        tracking: state.tracking.map((stock) => {
          if (stock.symbol === action.symbol) {
            return { ...stock, price: action.price };
          }
          return stock;
        })
      };

    case 'REMOVE_TRACKING':
      return {
        ...state,
        tracking: state.tracking.filter(
          (stock) => stock.symbol !== action.symbol
        )
      };

    case 'OVERVIEW_INIT':
      return {
        ...state,
        overviewInitialized: true
      };

    // case 'NEW_TRANSACTION':
    //   return {
    //     ...state,
    //     subscribed: state.subscribed.map((user) => {
    //       if (user.username === action.transaction.user) {
    //         return {
    //           ...user,
    //           transactions: user.transactions.concat(action.transaction)
    //         };
    //       }
    //       return user;
    //     })
    //   };

    // case 'DELETE_TRANSACTION':
    //   return {
    //     ...state,
    //     subscribed: state.subscribed.map((user) => {
    //       if (user.username === action.user) {
    //         return {
    //           ...user,
    //           stocks: user.transactions.filter(
    //             (stock) => stock.id !== action.id
    //           )
    //         };
    //       }
    //       return user;
    //     })
    //   };

    default:
      return state;
  }
};

export default usersReducer;
