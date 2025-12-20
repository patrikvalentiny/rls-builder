import localforage from "localforage";
import { STORAGE_NAME, STORE_NAME } from "./storageKeys";

const rls_store = localforage.createInstance({
        name: STORAGE_NAME,
        storeName: STORE_NAME
});

export { rls_store };

