const initState = {
  auth: {
    token: '',
    userId: ''
  },
  leaderboard: [],
  subscribed: []
};

const usersReducer = (state = initState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, auth: { ...action.auth } };

    case 'LOGOUT':
      return { ...state, auth: initState.auth };

    case 'SET_LEADERBOARD':
      return { ...state, leaderboard: action.users };

    case 'ADD_SUBSCRIBED':
      return { ...state, subscribed: state.subscribed.concat(action.user) };

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

    case 'NEW_TRANSACTION':
      return {
        ...state,
        subscribed: state.subscribed.map((user) => {
          if (user.username === action.transaction.user) {
            return { ...user, stocks: user.stocks.concat(action.transaction) };
          }
          return user;
        })
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        subscribed: state.subscribed.map((user) => {
          if (user.username === action.user) {
            return {
              ...user,
              stocks: user.stocks.filter((stock) => stock.id !== action.id)
            };
          }
          return user;
        })
      };

    default:
      return state;
  }
};

// const usersReducer = (state = [], action) => {
//   switch (action.type) {
//     case 'INIT_USERS':
//       return action.initState;

//     case 'UPDATE_ALL_USERS':
//       return action.newState;

//     case 'NEW_USER':
//       return state.concat(action.newUser);

//     case 'NEW_TRANSACTION':
//       const transaction = action.newTransaction;
//       return state.map((user) => {
//         if (user.username === transaction.user) {
//           return { ...user, stocks: user.stocks.concat(transaction) };
//         }
//         return user;
//       });

//     case 'UPDATE_TRANSACTION':
//       const { symbol, newPrice, id } = action.data;
//       const updateUser = state.find((user) => user.id === id);
//       const updateStocks = updateUser.stocks.map((stock) => {
//         if (stock.symbol === symbol) {
//           let change = stock.shares * (newPrice - stock.current_price);
//           change = stock.is_short ? -1 * change : change;
//           console.log(
//             stock.symbol,
//             stock.is_short ? 'short' : 'purchase',
//             'changed by',
//             change
//           );

//           if (change > 0) {
//             updateUser.balance += change;
//           }
//           updateUser.worth += change;

//           return { ...stock, current_price: newPrice };
//         }
//         return stock;
//       });

//       return state.map((user) => {
//         if (user.id === id) {
//           return { ...updateUser, stocks: updateStocks };
//         }
//         return user;
//       });

//     // return state.map((user) => {
//     //   if (user.id === id) {
//     //     return {
//     //       ...user,
//     //       stocks: user.stocks.map((stock) => {
//     //         if (stock.symbol === symbol) {
//     //           return { ...stock, current_price: newPrice };
//     //         }
//     //         return stock;
//     //       })
//     //     };
//     //   }
//     //   return user;
//     // });

//     default:
//       return state;
//   }
// };

export default usersReducer;
