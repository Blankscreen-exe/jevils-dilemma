import { configureStore } from '@reduxjs/toolkit'
import counterReducer from "./redux/slices/counterSlice.jsx"
import storage from "@react-native-async-storage/async-storage"
import { persistStore, persistReducer, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, } from "redux-persist";

const persistConfig = {
  key: "root",
  storage,
  version: 1
}

const rootReducer = combineReducers({ 
  counter,
  // any other reducers go here
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: {
    counter: persistedReducer,
  },
  middleware: (getDefaultMiddleWare) =>
  getDefaultMiddleWare({
    serializableCheck: {
      ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  })
})

export const persistor = persistStore(store);

export default store;