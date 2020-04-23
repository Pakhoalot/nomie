/**
 * User Store
 * 
 */
import Logger from "../utils/log/log";
import { writable } from "svelte/store";
import { update_keyed_each } from "svelte/internal";

const userInit = () {
  let listeners = [];
  let state = {
    storageType: Storage.local.get("root/storage_type"),
    ready: false,
    signedIn: undefined,
    launchCount: Storage.local.get("root/lauch_count") || 0,
    profile: {
      useranme: null,
    },
    alwaysLocate: JSON.parse(
      localStorage.getItem(config.always_locate_key) || "false",
    ),
    theme: localStorage.getItem(config.theme_key) || "auto",
    location: null,
    autoImportApi: false,
    meta: {
      lock: false,
      pin: null,
      aggressiveSync: false,
      is24Hour: false
    },
    locked: true,

  }

  const methods = {
    getStorageEngine() {
      return Storage._storageType();
    },
    initialize() {
      state.launchCount++;
      Storage.local.put("root/launch_count", state.launchCount);

      if(!Storage._storageType()) {
        
        update(p => {
          p.signedIn = false;
          p.launchCount = 0;
          return p;
        })
      } else {
        Storage.onReady(() => {
          methods
            .bootstrap()
            .then(() => {
              update(d => {
                d.ready = true;
                d.signedIn = true;
                d.profile = Storage.getProfile();
              })
            })
        })
      }
    }

  }
}