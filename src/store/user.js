/**
 * User Store
 * 
 */
import Logger from "../utils/log/log";
import { writable } from "svelte/store";

import Storage from "../modules/storage/storage";

const logger = new Logger("🤠 userStore");
const UserSession = new blockstack.UserSession();

const userInit = function () {
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

  const { subscribe, set, update } = writable(state);
  
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

                return d;
              })
            })
            .catch(e => {
              logger.error(e.message);
            })
        });

        Storage.init();
      }
    },
    setStorage(type) {
      type = ["blockstack", "local", "pouchdb"].indexOf(type) > -1 ? type : "local";
      update(d => {
        d.storageType = type;
        Storage.local.put("root/storage_type", type);
        d.launchCount = state.launchCount;
        return d;
      });
      return type;
    },
    resetLaunchCount() {
      if(confirm("Reset Launch Count to zero?") === true) {
        Storage.local.put("root/launch_count", 0);
        update(d => {
          d.launchCount = 0;
          return d;
        });
      }
    },
    signout() {
      localStorage.clear();
      try {
        blockstack.signUserOut(window.location.origin);
      } catch(e) {}
      window.location.href = window.location.href;
    },
    setProfile(profile) {
      logger.log("user.setProfile", profile);
    },
    bootstrap() {
      let promises = [];
      promises.push(methods.loadMeta());
      promises.push(methods.loadTrackersAndBoards());
      return Promise.all(promises)
        .then(() => {
          return methods.fireReady(state);
        })
        .catch(e => {
          logger.error("bootstrap", e.message);
          alert(e.message);
        });
    },
    /**
     * Meta Data
     * Meta is unclassified data that is needed to make the app work
     * it's usually just user preferences but  can be used for other things
     *
     */

    /**
     * Load Meta for this user
     */
    loadMeta() {
      return Storage.get(config.user_meta_path).then(value => {
        if (value) {
          update(usr => {
            usr.meta = value;
            return usr;
          });
        }
        return value;
      });
    },
    /**
     * Save the Meta object for this user
     */
    saveMeta() {
      let usr = methods.data();
      if (Object.keys(usr.meta).length) {
        return Storage.put(config.user_meta_path, usr.meta);
      }
    },
  }
}
