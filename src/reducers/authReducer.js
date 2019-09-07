const initState = {
  token: '',
  userId: ''
};

const authReducer = (state = initState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, ...action.data };

    default:
      return state;
  }
};

export default authReducer;
