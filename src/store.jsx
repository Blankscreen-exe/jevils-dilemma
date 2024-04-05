import { configureStore } from '@reduxjs/toolkit'
import counterReducer from "./features/counter/counterSlice"
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

const persistedReducer = persistReducer(persistConfig, counterReducer)

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