import {createStore} from 'redux'
import {state} from './state'


const reduxStore = (state = state, action) => {

};

const store = createStore(reduxStore);
export default store;
