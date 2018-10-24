import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';

import clock from './clock';


const reducers = {
    clock,
}

export default combineReducers(reducers)
