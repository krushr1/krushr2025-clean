import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-CR5PFQOW.js";

// ../node_modules/@tanstack/query-core/build/modern/subscribable.js
var Subscribable = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
    this.subscribe = this.subscribe.bind(this);
  }
  subscribe(listener) {
    this.listeners.add(listener);
    this.onSubscribe();
    return () => {
      this.listeners.delete(listener);
      this.onUnsubscribe();
    };
  }
  hasListeners() {
    return this.listeners.size > 0;
  }
  onSubscribe() {
  }
  onUnsubscribe() {
  }
};

// ../node_modules/@tanstack/query-core/build/modern/utils.js
var isServer = typeof window === "undefined" || "Deno" in globalThis;
function noop() {
}
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function isValidTimeout(value) {
  return typeof value === "number" && value >= 0 && value !== Infinity;
}
function timeUntilStale(updatedAt, staleTime) {
  return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function resolveStaleTime(staleTime, query) {
  return typeof staleTime === "function" ? staleTime(query) : staleTime;
}
function resolveEnabled(enabled, query) {
  return typeof enabled === "function" ? enabled(query) : enabled;
}
function matchQuery(filters, query) {
  const {
    type = "all",
    exact,
    fetchStatus,
    predicate,
    queryKey,
    stale
  } = filters;
  if (queryKey) {
    if (exact) {
      if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) {
        return false;
      }
    } else if (!partialMatchKey(query.queryKey, queryKey)) {
      return false;
    }
  }
  if (type !== "all") {
    const isActive = query.isActive();
    if (type === "active" && !isActive) {
      return false;
    }
    if (type === "inactive" && isActive) {
      return false;
    }
  }
  if (typeof stale === "boolean" && query.isStale() !== stale) {
    return false;
  }
  if (fetchStatus && fetchStatus !== query.state.fetchStatus) {
    return false;
  }
  if (predicate && !predicate(query)) {
    return false;
  }
  return true;
}
function matchMutation(filters, mutation) {
  const { exact, status, predicate, mutationKey } = filters;
  if (mutationKey) {
    if (!mutation.options.mutationKey) {
      return false;
    }
    if (exact) {
      if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) {
        return false;
      }
    } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) {
      return false;
    }
  }
  if (status && mutation.state.status !== status) {
    return false;
  }
  if (predicate && !predicate(mutation)) {
    return false;
  }
  return true;
}
function hashQueryKeyByOptions(queryKey, options) {
  const hashFn = options?.queryKeyHashFn || hashKey;
  return hashFn(queryKey);
}
function hashKey(queryKey) {
  return JSON.stringify(
    queryKey,
    (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
      result[key] = val[key];
      return result;
    }, {}) : val
  );
}
function partialMatchKey(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    return Object.keys(b).every((key) => partialMatchKey(a[key], b[key]));
  }
  return false;
}
function replaceEqualDeep(a, b) {
  if (a === b) {
    return a;
  }
  const array = isPlainArray(a) && isPlainArray(b);
  if (array || isPlainObject(a) && isPlainObject(b)) {
    const aItems = array ? a : Object.keys(a);
    const aSize = aItems.length;
    const bItems = array ? b : Object.keys(b);
    const bSize = bItems.length;
    const copy = array ? [] : {};
    const aItemsSet = new Set(aItems);
    let equalItems = 0;
    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i];
      if ((!array && aItemsSet.has(key) || array) && a[key] === void 0 && b[key] === void 0) {
        copy[key] = void 0;
        equalItems++;
      } else {
        copy[key] = replaceEqualDeep(a[key], b[key]);
        if (copy[key] === a[key] && a[key] !== void 0) {
          equalItems++;
        }
      }
    }
    return aSize === bSize && equalItems === aSize ? a : copy;
  }
  return b;
}
function shallowEqualObjects(a, b) {
  if (!b || Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
function isPlainArray(value) {
  return Array.isArray(value) && value.length === Object.keys(value).length;
}
function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  }
  const ctor = o.constructor;
  if (ctor === void 0) {
    return true;
  }
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  if (Object.getPrototypeOf(o) !== Object.prototype) {
    return false;
  }
  return true;
}
function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
function replaceData(prevData, data, options) {
  if (typeof options.structuralSharing === "function") {
    return options.structuralSharing(prevData, data);
  } else if (options.structuralSharing !== false) {
    if (true) {
      try {
        return replaceEqualDeep(prevData, data);
      } catch (error) {
        console.error(
          `Structural sharing requires data to be JSON serializable. To fix this, turn off structuralSharing or return JSON-serializable data from your queryFn. [${options.queryHash}]: ${error}`
        );
        throw error;
      }
    }
    return replaceEqualDeep(prevData, data);
  }
  return data;
}
function addToEnd(items, item, max = 0) {
  const newItems = [...items, item];
  return max && newItems.length > max ? newItems.slice(1) : newItems;
}
function addToStart(items, item, max = 0) {
  const newItems = [item, ...items];
  return max && newItems.length > max ? newItems.slice(0, -1) : newItems;
}
var skipToken = Symbol();
function ensureQueryFn(options, fetchOptions) {
  if (true) {
    if (options.queryFn === skipToken) {
      console.error(
        `Attempted to invoke queryFn when set to skipToken. This is likely a configuration error. Query hash: '${options.queryHash}'`
      );
    }
  }
  if (!options.queryFn && fetchOptions?.initialPromise) {
    return () => fetchOptions.initialPromise;
  }
  if (!options.queryFn || options.queryFn === skipToken) {
    return () => Promise.reject(new Error(`Missing queryFn: '${options.queryHash}'`));
  }
  return options.queryFn;
}
function shouldThrowError(throwOnError, params) {
  if (typeof throwOnError === "function") {
    return throwOnError(...params);
  }
  return !!throwOnError;
}

// ../node_modules/@tanstack/query-core/build/modern/focusManager.js
var FocusManager = class extends Subscribable {
  #focused;
  #cleanup;
  #setup;
  constructor() {
    super();
    this.#setup = (onFocus) => {
      if (!isServer && window.addEventListener) {
        const listener = () => onFocus();
        window.addEventListener("visibilitychange", listener, false);
        return () => {
          window.removeEventListener("visibilitychange", listener);
        };
      }
      return;
    };
  }
  onSubscribe() {
    if (!this.#cleanup) {
      this.setEventListener(this.#setup);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#cleanup?.();
      this.#cleanup = void 0;
    }
  }
  setEventListener(setup) {
    this.#setup = setup;
    this.#cleanup?.();
    this.#cleanup = setup((focused) => {
      if (typeof focused === "boolean") {
        this.setFocused(focused);
      } else {
        this.onFocus();
      }
    });
  }
  setFocused(focused) {
    const changed = this.#focused !== focused;
    if (changed) {
      this.#focused = focused;
      this.onFocus();
    }
  }
  onFocus() {
    const isFocused = this.isFocused();
    this.listeners.forEach((listener) => {
      listener(isFocused);
    });
  }
  isFocused() {
    if (typeof this.#focused === "boolean") {
      return this.#focused;
    }
    return globalThis.document?.visibilityState !== "hidden";
  }
};
var focusManager = new FocusManager();

// ../node_modules/@tanstack/query-core/build/modern/onlineManager.js
var OnlineManager = class extends Subscribable {
  #online = true;
  #cleanup;
  #setup;
  constructor() {
    super();
    this.#setup = (onOnline) => {
      if (!isServer && window.addEventListener) {
        const onlineListener = () => onOnline(true);
        const offlineListener = () => onOnline(false);
        window.addEventListener("online", onlineListener, false);
        window.addEventListener("offline", offlineListener, false);
        return () => {
          window.removeEventListener("online", onlineListener);
          window.removeEventListener("offline", offlineListener);
        };
      }
      return;
    };
  }
  onSubscribe() {
    if (!this.#cleanup) {
      this.setEventListener(this.#setup);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#cleanup?.();
      this.#cleanup = void 0;
    }
  }
  setEventListener(setup) {
    this.#setup = setup;
    this.#cleanup?.();
    this.#cleanup = setup(this.setOnline.bind(this));
  }
  setOnline(online) {
    const changed = this.#online !== online;
    if (changed) {
      this.#online = online;
      this.listeners.forEach((listener) => {
        listener(online);
      });
    }
  }
  isOnline() {
    return this.#online;
  }
};
var onlineManager = new OnlineManager();

// ../node_modules/@tanstack/query-core/build/modern/thenable.js
function pendingThenable() {
  let resolve;
  let reject;
  const thenable = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  thenable.status = "pending";
  thenable.catch(() => {
  });
  function finalize(data) {
    Object.assign(thenable, data);
    delete thenable.resolve;
    delete thenable.reject;
  }
  thenable.resolve = (value) => {
    finalize({
      status: "fulfilled",
      value
    });
    resolve(value);
  };
  thenable.reject = (reason) => {
    finalize({
      status: "rejected",
      reason
    });
    reject(reason);
  };
  return thenable;
}

// ../node_modules/@tanstack/query-core/build/modern/retryer.js
function defaultRetryDelay(failureCount) {
  return Math.min(1e3 * 2 ** failureCount, 3e4);
}
function canFetch(networkMode) {
  return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
}
var CancelledError = class extends Error {
  constructor(options) {
    super("CancelledError");
    this.revert = options?.revert;
    this.silent = options?.silent;
  }
};
function isCancelledError(value) {
  return value instanceof CancelledError;
}
function createRetryer(config) {
  let isRetryCancelled = false;
  let failureCount = 0;
  let isResolved = false;
  let continueFn;
  const thenable = pendingThenable();
  const cancel = (cancelOptions) => {
    if (!isResolved) {
      reject(new CancelledError(cancelOptions));
      config.abort?.();
    }
  };
  const cancelRetry = () => {
    isRetryCancelled = true;
  };
  const continueRetry = () => {
    isRetryCancelled = false;
  };
  const canContinue = () => focusManager.isFocused() && (config.networkMode === "always" || onlineManager.isOnline()) && config.canRun();
  const canStart = () => canFetch(config.networkMode) && config.canRun();
  const resolve = (value) => {
    if (!isResolved) {
      isResolved = true;
      config.onSuccess?.(value);
      continueFn?.();
      thenable.resolve(value);
    }
  };
  const reject = (value) => {
    if (!isResolved) {
      isResolved = true;
      config.onError?.(value);
      continueFn?.();
      thenable.reject(value);
    }
  };
  const pause = () => {
    return new Promise((continueResolve) => {
      continueFn = (value) => {
        if (isResolved || canContinue()) {
          continueResolve(value);
        }
      };
      config.onPause?.();
    }).then(() => {
      continueFn = void 0;
      if (!isResolved) {
        config.onContinue?.();
      }
    });
  };
  const run2 = () => {
    if (isResolved) {
      return;
    }
    let promiseOrValue;
    const initialPromise = failureCount === 0 ? config.initialPromise : void 0;
    try {
      promiseOrValue = initialPromise ?? config.fn();
    } catch (error) {
      promiseOrValue = Promise.reject(error);
    }
    Promise.resolve(promiseOrValue).then(resolve).catch((error) => {
      if (isResolved) {
        return;
      }
      const retry = config.retry ?? (isServer ? 0 : 3);
      const retryDelay = config.retryDelay ?? defaultRetryDelay;
      const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
      const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
      if (isRetryCancelled || !shouldRetry) {
        reject(error);
        return;
      }
      failureCount++;
      config.onFail?.(failureCount, error);
      sleep(delay).then(() => {
        return canContinue() ? void 0 : pause();
      }).then(() => {
        if (isRetryCancelled) {
          reject(error);
        } else {
          run2();
        }
      });
    });
  };
  return {
    promise: thenable,
    cancel,
    continue: () => {
      continueFn?.();
      return thenable;
    },
    cancelRetry,
    continueRetry,
    canStart,
    start: () => {
      if (canStart()) {
        run2();
      } else {
        pause().then(run2);
      }
      return thenable;
    }
  };
}

// ../node_modules/@tanstack/query-core/build/modern/notifyManager.js
var defaultScheduler = (cb) => setTimeout(cb, 0);
function createNotifyManager() {
  let queue = [];
  let transactions = 0;
  let notifyFn = (callback) => {
    callback();
  };
  let batchNotifyFn = (callback) => {
    callback();
  };
  let scheduleFn = defaultScheduler;
  const schedule = (callback) => {
    if (transactions) {
      queue.push(callback);
    } else {
      scheduleFn(() => {
        notifyFn(callback);
      });
    }
  };
  const flush = () => {
    const originalQueue = queue;
    queue = [];
    if (originalQueue.length) {
      scheduleFn(() => {
        batchNotifyFn(() => {
          originalQueue.forEach((callback) => {
            notifyFn(callback);
          });
        });
      });
    }
  };
  return {
    batch: (callback) => {
      let result;
      transactions++;
      try {
        result = callback();
      } finally {
        transactions--;
        if (!transactions) {
          flush();
        }
      }
      return result;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (callback) => {
      return (...args) => {
        schedule(() => {
          callback(...args);
        });
      };
    },
    schedule,
    /**
     * Use this method to set a custom notify function.
     * This can be used to for example wrap notifications with `React.act` while running tests.
     */
    setNotifyFunction: (fn) => {
      notifyFn = fn;
    },
    /**
     * Use this method to set a custom function to batch notifications together into a single tick.
     * By default React Query will use the batch function provided by ReactDOM or React Native.
     */
    setBatchNotifyFunction: (fn) => {
      batchNotifyFn = fn;
    },
    setScheduler: (fn) => {
      scheduleFn = fn;
    }
  };
}
var notifyManager = createNotifyManager();

// ../node_modules/@tanstack/query-core/build/modern/removable.js
var Removable = class {
  #gcTimeout;
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout();
    if (isValidTimeout(this.gcTime)) {
      this.#gcTimeout = setTimeout(() => {
        this.optionalRemove();
      }, this.gcTime);
    }
  }
  updateGcTime(newGcTime) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      newGcTime ?? (isServer ? Infinity : 5 * 60 * 1e3)
    );
  }
  clearGcTimeout() {
    if (this.#gcTimeout) {
      clearTimeout(this.#gcTimeout);
      this.#gcTimeout = void 0;
    }
  }
};

// ../node_modules/@tanstack/query-core/build/modern/query.js
var Query = class extends Removable {
  #initialState;
  #revertState;
  #cache;
  #client;
  #retryer;
  #defaultOptions;
  #abortSignalConsumed;
  constructor(config) {
    super();
    this.#abortSignalConsumed = false;
    this.#defaultOptions = config.defaultOptions;
    this.setOptions(config.options);
    this.observers = [];
    this.#client = config.client;
    this.#cache = this.#client.getQueryCache();
    this.queryKey = config.queryKey;
    this.queryHash = config.queryHash;
    this.#initialState = getDefaultState(this.options);
    this.state = config.state ?? this.#initialState;
    this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  get promise() {
    return this.#retryer?.promise;
  }
  setOptions(options) {
    this.options = { ...this.#defaultOptions, ...options };
    this.updateGcTime(this.options.gcTime);
  }
  optionalRemove() {
    if (!this.observers.length && this.state.fetchStatus === "idle") {
      this.#cache.remove(this);
    }
  }
  setData(newData, options) {
    const data = replaceData(this.state.data, newData, this.options);
    this.#dispatch({
      data,
      type: "success",
      dataUpdatedAt: options?.updatedAt,
      manual: options?.manual
    });
    return data;
  }
  setState(state, setStateOptions) {
    this.#dispatch({ type: "setState", state, setStateOptions });
  }
  cancel(options) {
    const promise = this.#retryer?.promise;
    this.#retryer?.cancel(options);
    return promise ? promise.then(noop).catch(noop) : Promise.resolve();
  }
  destroy() {
    super.destroy();
    this.cancel({ silent: true });
  }
  reset() {
    this.destroy();
    this.setState(this.#initialState);
  }
  isActive() {
    return this.observers.some(
      (observer) => resolveEnabled(observer.options.enabled, this) !== false
    );
  }
  isDisabled() {
    if (this.getObserversCount() > 0) {
      return !this.isActive();
    }
    return this.options.queryFn === skipToken || this.state.dataUpdateCount + this.state.errorUpdateCount === 0;
  }
  isStatic() {
    if (this.getObserversCount() > 0) {
      return this.observers.some(
        (observer) => resolveStaleTime(observer.options.staleTime, this) === "static"
      );
    }
    return false;
  }
  isStale() {
    if (this.getObserversCount() > 0) {
      return this.observers.some(
        (observer) => observer.getCurrentResult().isStale
      );
    }
    return this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(staleTime = 0) {
    if (this.state.data === void 0) {
      return true;
    }
    if (staleTime === "static") {
      return false;
    }
    if (this.state.isInvalidated) {
      return true;
    }
    return !timeUntilStale(this.state.dataUpdatedAt, staleTime);
  }
  onFocus() {
    const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus());
    observer?.refetch({ cancelRefetch: false });
    this.#retryer?.continue();
  }
  onOnline() {
    const observer = this.observers.find((x) => x.shouldFetchOnReconnect());
    observer?.refetch({ cancelRefetch: false });
    this.#retryer?.continue();
  }
  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      this.clearGcTimeout();
      this.#cache.notify({ type: "observerAdded", query: this, observer });
    }
  }
  removeObserver(observer) {
    if (this.observers.includes(observer)) {
      this.observers = this.observers.filter((x) => x !== observer);
      if (!this.observers.length) {
        if (this.#retryer) {
          if (this.#abortSignalConsumed) {
            this.#retryer.cancel({ revert: true });
          } else {
            this.#retryer.cancelRetry();
          }
        }
        this.scheduleGc();
      }
      this.#cache.notify({ type: "observerRemoved", query: this, observer });
    }
  }
  getObserversCount() {
    return this.observers.length;
  }
  invalidate() {
    if (!this.state.isInvalidated) {
      this.#dispatch({ type: "invalidate" });
    }
  }
  fetch(options, fetchOptions) {
    if (this.state.fetchStatus !== "idle") {
      if (this.state.data !== void 0 && fetchOptions?.cancelRefetch) {
        this.cancel({ silent: true });
      } else if (this.#retryer) {
        this.#retryer.continueRetry();
        return this.#retryer.promise;
      }
    }
    if (options) {
      this.setOptions(options);
    }
    if (!this.options.queryFn) {
      const observer = this.observers.find((x) => x.options.queryFn);
      if (observer) {
        this.setOptions(observer.options);
      }
    }
    if (true) {
      if (!Array.isArray(this.options.queryKey)) {
        console.error(
          `As of v4, queryKey needs to be an Array. If you are using a string like 'repoData', please change it to an Array, e.g. ['repoData']`
        );
      }
    }
    const abortController = new AbortController();
    const addSignalProperty = (object) => {
      Object.defineProperty(object, "signal", {
        enumerable: true,
        get: () => {
          this.#abortSignalConsumed = true;
          return abortController.signal;
        }
      });
    };
    const fetchFn = () => {
      const queryFn = ensureQueryFn(this.options, fetchOptions);
      const createQueryFnContext = () => {
        const queryFnContext2 = {
          client: this.#client,
          queryKey: this.queryKey,
          meta: this.meta
        };
        addSignalProperty(queryFnContext2);
        return queryFnContext2;
      };
      const queryFnContext = createQueryFnContext();
      this.#abortSignalConsumed = false;
      if (this.options.persister) {
        return this.options.persister(
          queryFn,
          queryFnContext,
          this
        );
      }
      return queryFn(queryFnContext);
    };
    const createFetchContext = () => {
      const context2 = {
        fetchOptions,
        options: this.options,
        queryKey: this.queryKey,
        client: this.#client,
        state: this.state,
        fetchFn
      };
      addSignalProperty(context2);
      return context2;
    };
    const context = createFetchContext();
    this.options.behavior?.onFetch(context, this);
    this.#revertState = this.state;
    if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== context.fetchOptions?.meta) {
      this.#dispatch({ type: "fetch", meta: context.fetchOptions?.meta });
    }
    const onError = (error) => {
      if (!(isCancelledError(error) && error.silent)) {
        this.#dispatch({
          type: "error",
          error
        });
      }
      if (!isCancelledError(error)) {
        this.#cache.config.onError?.(
          error,
          this
        );
        this.#cache.config.onSettled?.(
          this.state.data,
          error,
          this
        );
      }
      this.scheduleGc();
    };
    this.#retryer = createRetryer({
      initialPromise: fetchOptions?.initialPromise,
      fn: context.fetchFn,
      abort: abortController.abort.bind(abortController),
      onSuccess: (data) => {
        if (data === void 0) {
          if (true) {
            console.error(
              `Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. Affected query key: ${this.queryHash}`
            );
          }
          onError(new Error(`${this.queryHash} data is undefined`));
          return;
        }
        try {
          this.setData(data);
        } catch (error) {
          onError(error);
          return;
        }
        this.#cache.config.onSuccess?.(data, this);
        this.#cache.config.onSettled?.(
          data,
          this.state.error,
          this
        );
        this.scheduleGc();
      },
      onError,
      onFail: (failureCount, error) => {
        this.#dispatch({ type: "failed", failureCount, error });
      },
      onPause: () => {
        this.#dispatch({ type: "pause" });
      },
      onContinue: () => {
        this.#dispatch({ type: "continue" });
      },
      retry: context.options.retry,
      retryDelay: context.options.retryDelay,
      networkMode: context.options.networkMode,
      canRun: () => true
    });
    return this.#retryer.start();
  }
  #dispatch(action) {
    const reducer = (state) => {
      switch (action.type) {
        case "failed":
          return {
            ...state,
            fetchFailureCount: action.failureCount,
            fetchFailureReason: action.error
          };
        case "pause":
          return {
            ...state,
            fetchStatus: "paused"
          };
        case "continue":
          return {
            ...state,
            fetchStatus: "fetching"
          };
        case "fetch":
          return {
            ...state,
            ...fetchState(state.data, this.options),
            fetchMeta: action.meta ?? null
          };
        case "success":
          this.#revertState = void 0;
          return {
            ...state,
            data: action.data,
            dataUpdateCount: state.dataUpdateCount + 1,
            dataUpdatedAt: action.dataUpdatedAt ?? Date.now(),
            error: null,
            isInvalidated: false,
            status: "success",
            ...!action.manual && {
              fetchStatus: "idle",
              fetchFailureCount: 0,
              fetchFailureReason: null
            }
          };
        case "error":
          const error = action.error;
          if (isCancelledError(error) && error.revert && this.#revertState) {
            return { ...this.#revertState, fetchStatus: "idle" };
          }
          return {
            ...state,
            error,
            errorUpdateCount: state.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: state.fetchFailureCount + 1,
            fetchFailureReason: error,
            fetchStatus: "idle",
            status: "error"
          };
        case "invalidate":
          return {
            ...state,
            isInvalidated: true
          };
        case "setState":
          return {
            ...state,
            ...action.state
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.observers.forEach((observer) => {
        observer.onQueryUpdate();
      });
      this.#cache.notify({ query: this, type: "updated", action });
    });
  }
};
function fetchState(data, options) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
    ...data === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function getDefaultState(options) {
  const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
  const hasData = data !== void 0;
  const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
  return {
    data,
    dataUpdateCount: 0,
    dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: false,
    status: hasData ? "success" : "pending",
    fetchStatus: "idle"
  };
}

// ../node_modules/@tanstack/query-core/build/modern/queryCache.js
var QueryCache = class extends Subscribable {
  constructor(config = {}) {
    super();
    this.config = config;
    this.#queries = /* @__PURE__ */ new Map();
  }
  #queries;
  build(client, options, state) {
    const queryKey = options.queryKey;
    const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
    let query = this.get(queryHash);
    if (!query) {
      query = new Query({
        client,
        queryKey,
        queryHash,
        options: client.defaultQueryOptions(options),
        state,
        defaultOptions: client.getQueryDefaults(queryKey)
      });
      this.add(query);
    }
    return query;
  }
  add(query) {
    if (!this.#queries.has(query.queryHash)) {
      this.#queries.set(query.queryHash, query);
      this.notify({
        type: "added",
        query
      });
    }
  }
  remove(query) {
    const queryInMap = this.#queries.get(query.queryHash);
    if (queryInMap) {
      query.destroy();
      if (queryInMap === query) {
        this.#queries.delete(query.queryHash);
      }
      this.notify({ type: "removed", query });
    }
  }
  clear() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        this.remove(query);
      });
    });
  }
  get(queryHash) {
    return this.#queries.get(queryHash);
  }
  getAll() {
    return [...this.#queries.values()];
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (query) => matchQuery(defaultedFilters, query)
    );
  }
  findAll(filters = {}) {
    const queries = this.getAll();
    return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  onFocus() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onFocus();
      });
    });
  }
  onOnline() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onOnline();
      });
    });
  }
};

// ../node_modules/@tanstack/query-core/build/modern/mutation.js
var Mutation = class extends Removable {
  #observers;
  #mutationCache;
  #retryer;
  constructor(config) {
    super();
    this.mutationId = config.mutationId;
    this.#mutationCache = config.mutationCache;
    this.#observers = [];
    this.state = config.state || getDefaultState2();
    this.setOptions(config.options);
    this.scheduleGc();
  }
  setOptions(options) {
    this.options = options;
    this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(observer) {
    if (!this.#observers.includes(observer)) {
      this.#observers.push(observer);
      this.clearGcTimeout();
      this.#mutationCache.notify({
        type: "observerAdded",
        mutation: this,
        observer
      });
    }
  }
  removeObserver(observer) {
    this.#observers = this.#observers.filter((x) => x !== observer);
    this.scheduleGc();
    this.#mutationCache.notify({
      type: "observerRemoved",
      mutation: this,
      observer
    });
  }
  optionalRemove() {
    if (!this.#observers.length) {
      if (this.state.status === "pending") {
        this.scheduleGc();
      } else {
        this.#mutationCache.remove(this);
      }
    }
  }
  continue() {
    return this.#retryer?.continue() ?? // continuing a mutation assumes that variables are set, mutation must have been dehydrated before
    this.execute(this.state.variables);
  }
  async execute(variables) {
    const onContinue = () => {
      this.#dispatch({ type: "continue" });
    };
    this.#retryer = createRetryer({
      fn: () => {
        if (!this.options.mutationFn) {
          return Promise.reject(new Error("No mutationFn found"));
        }
        return this.options.mutationFn(variables);
      },
      onFail: (failureCount, error) => {
        this.#dispatch({ type: "failed", failureCount, error });
      },
      onPause: () => {
        this.#dispatch({ type: "pause" });
      },
      onContinue,
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => this.#mutationCache.canRun(this)
    });
    const restored = this.state.status === "pending";
    const isPaused = !this.#retryer.canStart();
    try {
      if (restored) {
        onContinue();
      } else {
        this.#dispatch({ type: "pending", variables, isPaused });
        await this.#mutationCache.config.onMutate?.(
          variables,
          this
        );
        const context = await this.options.onMutate?.(variables);
        if (context !== this.state.context) {
          this.#dispatch({
            type: "pending",
            context,
            variables,
            isPaused
          });
        }
      }
      const data = await this.#retryer.start();
      await this.#mutationCache.config.onSuccess?.(
        data,
        variables,
        this.state.context,
        this
      );
      await this.options.onSuccess?.(data, variables, this.state.context);
      await this.#mutationCache.config.onSettled?.(
        data,
        null,
        this.state.variables,
        this.state.context,
        this
      );
      await this.options.onSettled?.(data, null, variables, this.state.context);
      this.#dispatch({ type: "success", data });
      return data;
    } catch (error) {
      try {
        await this.#mutationCache.config.onError?.(
          error,
          variables,
          this.state.context,
          this
        );
        await this.options.onError?.(
          error,
          variables,
          this.state.context
        );
        await this.#mutationCache.config.onSettled?.(
          void 0,
          error,
          this.state.variables,
          this.state.context,
          this
        );
        await this.options.onSettled?.(
          void 0,
          error,
          variables,
          this.state.context
        );
        throw error;
      } finally {
        this.#dispatch({ type: "error", error });
      }
    } finally {
      this.#mutationCache.runNext(this);
    }
  }
  #dispatch(action) {
    const reducer = (state) => {
      switch (action.type) {
        case "failed":
          return {
            ...state,
            failureCount: action.failureCount,
            failureReason: action.error
          };
        case "pause":
          return {
            ...state,
            isPaused: true
          };
        case "continue":
          return {
            ...state,
            isPaused: false
          };
        case "pending":
          return {
            ...state,
            context: action.context,
            data: void 0,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: action.isPaused,
            status: "pending",
            variables: action.variables,
            submittedAt: Date.now()
          };
        case "success":
          return {
            ...state,
            data: action.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: false
          };
        case "error":
          return {
            ...state,
            data: void 0,
            error: action.error,
            failureCount: state.failureCount + 1,
            failureReason: action.error,
            isPaused: false,
            status: "error"
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.#observers.forEach((observer) => {
        observer.onMutationUpdate(action);
      });
      this.#mutationCache.notify({
        mutation: this,
        type: "updated",
        action
      });
    });
  }
};
function getDefaultState2() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}

// ../node_modules/@tanstack/query-core/build/modern/mutationCache.js
var MutationCache = class extends Subscribable {
  constructor(config = {}) {
    super();
    this.config = config;
    this.#mutations = /* @__PURE__ */ new Set();
    this.#scopes = /* @__PURE__ */ new Map();
    this.#mutationId = 0;
  }
  #mutations;
  #scopes;
  #mutationId;
  build(client, options, state) {
    const mutation = new Mutation({
      mutationCache: this,
      mutationId: ++this.#mutationId,
      options: client.defaultMutationOptions(options),
      state
    });
    this.add(mutation);
    return mutation;
  }
  add(mutation) {
    this.#mutations.add(mutation);
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const scopedMutations = this.#scopes.get(scope);
      if (scopedMutations) {
        scopedMutations.push(mutation);
      } else {
        this.#scopes.set(scope, [mutation]);
      }
    }
    this.notify({ type: "added", mutation });
  }
  remove(mutation) {
    if (this.#mutations.delete(mutation)) {
      const scope = scopeFor(mutation);
      if (typeof scope === "string") {
        const scopedMutations = this.#scopes.get(scope);
        if (scopedMutations) {
          if (scopedMutations.length > 1) {
            const index = scopedMutations.indexOf(mutation);
            if (index !== -1) {
              scopedMutations.splice(index, 1);
            }
          } else if (scopedMutations[0] === mutation) {
            this.#scopes.delete(scope);
          }
        }
      }
    }
    this.notify({ type: "removed", mutation });
  }
  canRun(mutation) {
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const mutationsWithSameScope = this.#scopes.get(scope);
      const firstPendingMutation = mutationsWithSameScope?.find(
        (m) => m.state.status === "pending"
      );
      return !firstPendingMutation || firstPendingMutation === mutation;
    } else {
      return true;
    }
  }
  runNext(mutation) {
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const foundMutation = this.#scopes.get(scope)?.find((m) => m !== mutation && m.state.isPaused);
      return foundMutation?.continue() ?? Promise.resolve();
    } else {
      return Promise.resolve();
    }
  }
  clear() {
    notifyManager.batch(() => {
      this.#mutations.forEach((mutation) => {
        this.notify({ type: "removed", mutation });
      });
      this.#mutations.clear();
      this.#scopes.clear();
    });
  }
  getAll() {
    return Array.from(this.#mutations);
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (mutation) => matchMutation(defaultedFilters, mutation)
    );
  }
  findAll(filters = {}) {
    return this.getAll().filter((mutation) => matchMutation(filters, mutation));
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  resumePausedMutations() {
    const pausedMutations = this.getAll().filter((x) => x.state.isPaused);
    return notifyManager.batch(
      () => Promise.all(
        pausedMutations.map((mutation) => mutation.continue().catch(noop))
      )
    );
  }
};
function scopeFor(mutation) {
  return mutation.options.scope?.id;
}

// ../node_modules/@tanstack/query-core/build/modern/infiniteQueryBehavior.js
function infiniteQueryBehavior(pages) {
  return {
    onFetch: (context, query) => {
      const options = context.options;
      const direction = context.fetchOptions?.meta?.fetchMore?.direction;
      const oldPages = context.state.data?.pages || [];
      const oldPageParams = context.state.data?.pageParams || [];
      let result = { pages: [], pageParams: [] };
      let currentPage = 0;
      const fetchFn = async () => {
        let cancelled = false;
        const addSignalProperty = (object) => {
          Object.defineProperty(object, "signal", {
            enumerable: true,
            get: () => {
              if (context.signal.aborted) {
                cancelled = true;
              } else {
                context.signal.addEventListener("abort", () => {
                  cancelled = true;
                });
              }
              return context.signal;
            }
          });
        };
        const queryFn = ensureQueryFn(context.options, context.fetchOptions);
        const fetchPage = async (data, param, previous) => {
          if (cancelled) {
            return Promise.reject();
          }
          if (param == null && data.pages.length) {
            return Promise.resolve(data);
          }
          const createQueryFnContext = () => {
            const queryFnContext2 = {
              client: context.client,
              queryKey: context.queryKey,
              pageParam: param,
              direction: previous ? "backward" : "forward",
              meta: context.options.meta
            };
            addSignalProperty(queryFnContext2);
            return queryFnContext2;
          };
          const queryFnContext = createQueryFnContext();
          const page = await queryFn(queryFnContext);
          const { maxPages } = context.options;
          const addTo = previous ? addToStart : addToEnd;
          return {
            pages: addTo(data.pages, page, maxPages),
            pageParams: addTo(data.pageParams, param, maxPages)
          };
        };
        if (direction && oldPages.length) {
          const previous = direction === "backward";
          const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
          const oldData = {
            pages: oldPages,
            pageParams: oldPageParams
          };
          const param = pageParamFn(options, oldData);
          result = await fetchPage(oldData, param, previous);
        } else {
          const remainingPages = pages ?? oldPages.length;
          do {
            const param = currentPage === 0 ? oldPageParams[0] ?? options.initialPageParam : getNextPageParam(options, result);
            if (currentPage > 0 && param == null) {
              break;
            }
            result = await fetchPage(result, param);
            currentPage++;
          } while (currentPage < remainingPages);
        }
        return result;
      };
      if (context.options.persister) {
        context.fetchFn = () => {
          return context.options.persister?.(
            fetchFn,
            {
              client: context.client,
              queryKey: context.queryKey,
              meta: context.options.meta,
              signal: context.signal
            },
            query
          );
        };
      } else {
        context.fetchFn = fetchFn;
      }
    }
  };
}
function getNextPageParam(options, { pages, pageParams }) {
  const lastIndex = pages.length - 1;
  return pages.length > 0 ? options.getNextPageParam(
    pages[lastIndex],
    pages,
    pageParams[lastIndex],
    pageParams
  ) : void 0;
}
function getPreviousPageParam(options, { pages, pageParams }) {
  return pages.length > 0 ? options.getPreviousPageParam?.(pages[0], pages, pageParams[0], pageParams) : void 0;
}
function hasNextPage(options, data) {
  if (!data) return false;
  return getNextPageParam(options, data) != null;
}
function hasPreviousPage(options, data) {
  if (!data || !options.getPreviousPageParam) return false;
  return getPreviousPageParam(options, data) != null;
}

// ../node_modules/@tanstack/query-core/build/modern/queryClient.js
var QueryClient = class {
  #queryCache;
  #mutationCache;
  #defaultOptions;
  #queryDefaults;
  #mutationDefaults;
  #mountCount;
  #unsubscribeFocus;
  #unsubscribeOnline;
  constructor(config = {}) {
    this.#queryCache = config.queryCache || new QueryCache();
    this.#mutationCache = config.mutationCache || new MutationCache();
    this.#defaultOptions = config.defaultOptions || {};
    this.#queryDefaults = /* @__PURE__ */ new Map();
    this.#mutationDefaults = /* @__PURE__ */ new Map();
    this.#mountCount = 0;
  }
  mount() {
    this.#mountCount++;
    if (this.#mountCount !== 1) return;
    this.#unsubscribeFocus = focusManager.subscribe(async (focused) => {
      if (focused) {
        await this.resumePausedMutations();
        this.#queryCache.onFocus();
      }
    });
    this.#unsubscribeOnline = onlineManager.subscribe(async (online) => {
      if (online) {
        await this.resumePausedMutations();
        this.#queryCache.onOnline();
      }
    });
  }
  unmount() {
    this.#mountCount--;
    if (this.#mountCount !== 0) return;
    this.#unsubscribeFocus?.();
    this.#unsubscribeFocus = void 0;
    this.#unsubscribeOnline?.();
    this.#unsubscribeOnline = void 0;
  }
  isFetching(filters) {
    return this.#queryCache.findAll({ ...filters, fetchStatus: "fetching" }).length;
  }
  isMutating(filters) {
    return this.#mutationCache.findAll({ ...filters, status: "pending" }).length;
  }
  /**
   * Imperative (non-reactive) way to retrieve data for a QueryKey.
   * Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
   *
   * Hint: Do not use this function inside a component, because it won't receive updates.
   * Use `useQuery` to create a `QueryObserver` that subscribes to changes.
   */
  getQueryData(queryKey) {
    const options = this.defaultQueryOptions({ queryKey });
    return this.#queryCache.get(options.queryHash)?.state.data;
  }
  ensureQueryData(options) {
    const defaultedOptions = this.defaultQueryOptions(options);
    const query = this.#queryCache.build(this, defaultedOptions);
    const cachedData = query.state.data;
    if (cachedData === void 0) {
      return this.fetchQuery(options);
    }
    if (options.revalidateIfStale && query.isStaleByTime(resolveStaleTime(defaultedOptions.staleTime, query))) {
      void this.prefetchQuery(defaultedOptions);
    }
    return Promise.resolve(cachedData);
  }
  getQueriesData(filters) {
    return this.#queryCache.findAll(filters).map(({ queryKey, state }) => {
      const data = state.data;
      return [queryKey, data];
    });
  }
  setQueryData(queryKey, updater, options) {
    const defaultedOptions = this.defaultQueryOptions({ queryKey });
    const query = this.#queryCache.get(
      defaultedOptions.queryHash
    );
    const prevData = query?.state.data;
    const data = functionalUpdate(updater, prevData);
    if (data === void 0) {
      return void 0;
    }
    return this.#queryCache.build(this, defaultedOptions).setData(data, { ...options, manual: true });
  }
  setQueriesData(filters, updater, options) {
    return notifyManager.batch(
      () => this.#queryCache.findAll(filters).map(({ queryKey }) => [
        queryKey,
        this.setQueryData(queryKey, updater, options)
      ])
    );
  }
  getQueryState(queryKey) {
    const options = this.defaultQueryOptions({ queryKey });
    return this.#queryCache.get(
      options.queryHash
    )?.state;
  }
  removeQueries(filters) {
    const queryCache = this.#queryCache;
    notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        queryCache.remove(query);
      });
    });
  }
  resetQueries(filters, options) {
    const queryCache = this.#queryCache;
    return notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        query.reset();
      });
      return this.refetchQueries(
        {
          type: "active",
          ...filters
        },
        options
      );
    });
  }
  cancelQueries(filters, cancelOptions = {}) {
    const defaultedCancelOptions = { revert: true, ...cancelOptions };
    const promises = notifyManager.batch(
      () => this.#queryCache.findAll(filters).map((query) => query.cancel(defaultedCancelOptions))
    );
    return Promise.all(promises).then(noop).catch(noop);
  }
  invalidateQueries(filters, options = {}) {
    return notifyManager.batch(() => {
      this.#queryCache.findAll(filters).forEach((query) => {
        query.invalidate();
      });
      if (filters?.refetchType === "none") {
        return Promise.resolve();
      }
      return this.refetchQueries(
        {
          ...filters,
          type: filters?.refetchType ?? filters?.type ?? "active"
        },
        options
      );
    });
  }
  refetchQueries(filters, options = {}) {
    const fetchOptions = {
      ...options,
      cancelRefetch: options.cancelRefetch ?? true
    };
    const promises = notifyManager.batch(
      () => this.#queryCache.findAll(filters).filter((query) => !query.isDisabled() && !query.isStatic()).map((query) => {
        let promise = query.fetch(void 0, fetchOptions);
        if (!fetchOptions.throwOnError) {
          promise = promise.catch(noop);
        }
        return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
      })
    );
    return Promise.all(promises).then(noop);
  }
  fetchQuery(options) {
    const defaultedOptions = this.defaultQueryOptions(options);
    if (defaultedOptions.retry === void 0) {
      defaultedOptions.retry = false;
    }
    const query = this.#queryCache.build(this, defaultedOptions);
    return query.isStaleByTime(
      resolveStaleTime(defaultedOptions.staleTime, query)
    ) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
  }
  prefetchQuery(options) {
    return this.fetchQuery(options).then(noop).catch(noop);
  }
  fetchInfiniteQuery(options) {
    options.behavior = infiniteQueryBehavior(options.pages);
    return this.fetchQuery(options);
  }
  prefetchInfiniteQuery(options) {
    return this.fetchInfiniteQuery(options).then(noop).catch(noop);
  }
  ensureInfiniteQueryData(options) {
    options.behavior = infiniteQueryBehavior(options.pages);
    return this.ensureQueryData(options);
  }
  resumePausedMutations() {
    if (onlineManager.isOnline()) {
      return this.#mutationCache.resumePausedMutations();
    }
    return Promise.resolve();
  }
  getQueryCache() {
    return this.#queryCache;
  }
  getMutationCache() {
    return this.#mutationCache;
  }
  getDefaultOptions() {
    return this.#defaultOptions;
  }
  setDefaultOptions(options) {
    this.#defaultOptions = options;
  }
  setQueryDefaults(queryKey, options) {
    this.#queryDefaults.set(hashKey(queryKey), {
      queryKey,
      defaultOptions: options
    });
  }
  getQueryDefaults(queryKey) {
    const defaults = [...this.#queryDefaults.values()];
    const result = {};
    defaults.forEach((queryDefault) => {
      if (partialMatchKey(queryKey, queryDefault.queryKey)) {
        Object.assign(result, queryDefault.defaultOptions);
      }
    });
    return result;
  }
  setMutationDefaults(mutationKey, options) {
    this.#mutationDefaults.set(hashKey(mutationKey), {
      mutationKey,
      defaultOptions: options
    });
  }
  getMutationDefaults(mutationKey) {
    const defaults = [...this.#mutationDefaults.values()];
    const result = {};
    defaults.forEach((queryDefault) => {
      if (partialMatchKey(mutationKey, queryDefault.mutationKey)) {
        Object.assign(result, queryDefault.defaultOptions);
      }
    });
    return result;
  }
  defaultQueryOptions(options) {
    if (options._defaulted) {
      return options;
    }
    const defaultedOptions = {
      ...this.#defaultOptions.queries,
      ...this.getQueryDefaults(options.queryKey),
      ...options,
      _defaulted: true
    };
    if (!defaultedOptions.queryHash) {
      defaultedOptions.queryHash = hashQueryKeyByOptions(
        defaultedOptions.queryKey,
        defaultedOptions
      );
    }
    if (defaultedOptions.refetchOnReconnect === void 0) {
      defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
    }
    if (defaultedOptions.throwOnError === void 0) {
      defaultedOptions.throwOnError = !!defaultedOptions.suspense;
    }
    if (!defaultedOptions.networkMode && defaultedOptions.persister) {
      defaultedOptions.networkMode = "offlineFirst";
    }
    if (defaultedOptions.queryFn === skipToken) {
      defaultedOptions.enabled = false;
    }
    return defaultedOptions;
  }
  defaultMutationOptions(options) {
    if (options?._defaulted) {
      return options;
    }
    return {
      ...this.#defaultOptions.mutations,
      ...options?.mutationKey && this.getMutationDefaults(options.mutationKey),
      ...options,
      _defaulted: true
    };
  }
  clear() {
    this.#queryCache.clear();
    this.#mutationCache.clear();
  }
};

// ../node_modules/@tanstack/query-core/build/modern/queryObserver.js
var QueryObserver = class extends Subscribable {
  constructor(client, options) {
    super();
    this.options = options;
    this.#client = client;
    this.#selectError = null;
    this.#currentThenable = pendingThenable();
    if (!this.options.experimental_prefetchInRender) {
      this.#currentThenable.reject(
        new Error("experimental_prefetchInRender feature flag is not enabled")
      );
    }
    this.bindMethods();
    this.setOptions(options);
  }
  #client;
  #currentQuery = void 0;
  #currentQueryInitialState = void 0;
  #currentResult = void 0;
  #currentResultState;
  #currentResultOptions;
  #currentThenable;
  #selectError;
  #selectFn;
  #selectResult;
  // This property keeps track of the last query with defined data.
  // It will be used to pass the previous data and query to the placeholder function between renders.
  #lastQueryWithDefinedData;
  #staleTimeoutId;
  #refetchIntervalId;
  #currentRefetchInterval;
  #trackedProps = /* @__PURE__ */ new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      this.#currentQuery.addObserver(this);
      if (shouldFetchOnMount(this.#currentQuery, this.options)) {
        this.#executeFetch();
      } else {
        this.updateResult();
      }
      this.#updateTimers();
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    this.#clearStaleTimeout();
    this.#clearRefetchInterval();
    this.#currentQuery.removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = this.#currentQuery;
    this.options = this.#client.defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, this.#currentQuery) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    this.#updateQuery();
    this.#currentQuery.setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: this.#currentQuery,
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      this.#currentQuery,
      prevQuery,
      this.options,
      prevOptions
    )) {
      this.#executeFetch();
    }
    this.updateResult();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || resolveStaleTime(this.options.staleTime, this.#currentQuery) !== resolveStaleTime(prevOptions.staleTime, this.#currentQuery))) {
      this.#updateStaleTimeout();
    }
    const nextRefetchInterval = this.#computeRefetchInterval();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) {
      this.#updateRefetchInterval(nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = this.#client.getQueryCache().build(this.#client, options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      this.#currentResult = result;
      this.#currentResultOptions = this.options;
      this.#currentResultState = this.#currentQuery.state;
    }
    return result;
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked?.(key);
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    this.#trackedProps.add(key);
  }
  getCurrentQuery() {
    return this.#currentQuery;
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = this.#client.defaultQueryOptions(options);
    const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return this.#executeFetch({
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return this.#currentResult;
    });
  }
  #executeFetch(fetchOptions) {
    this.#updateQuery();
    let promise = this.#currentQuery.fetch(
      this.options,
      fetchOptions
    );
    if (!fetchOptions?.throwOnError) {
      promise = promise.catch(noop);
    }
    return promise;
  }
  #updateStaleTimeout() {
    this.#clearStaleTimeout();
    const staleTime = resolveStaleTime(
      this.options.staleTime,
      this.#currentQuery
    );
    if (isServer || this.#currentResult.isStale || !isValidTimeout(staleTime)) {
      return;
    }
    const time = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime);
    const timeout = time + 1;
    this.#staleTimeoutId = setTimeout(() => {
      if (!this.#currentResult.isStale) {
        this.updateResult();
      }
    }, timeout);
  }
  #computeRefetchInterval() {
    return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.#currentQuery) : this.options.refetchInterval) ?? false;
  }
  #updateRefetchInterval(nextInterval) {
    this.#clearRefetchInterval();
    this.#currentRefetchInterval = nextInterval;
    if (isServer || resolveEnabled(this.options.enabled, this.#currentQuery) === false || !isValidTimeout(this.#currentRefetchInterval) || this.#currentRefetchInterval === 0) {
      return;
    }
    this.#refetchIntervalId = setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
        this.#executeFetch();
      }
    }, this.#currentRefetchInterval);
  }
  #updateTimers() {
    this.#updateStaleTimeout();
    this.#updateRefetchInterval(this.#computeRefetchInterval());
  }
  #clearStaleTimeout() {
    if (this.#staleTimeoutId) {
      clearTimeout(this.#staleTimeoutId);
      this.#staleTimeoutId = void 0;
    }
  }
  #clearRefetchInterval() {
    if (this.#refetchIntervalId) {
      clearInterval(this.#refetchIntervalId);
      this.#refetchIntervalId = void 0;
    }
  }
  createResult(query, options) {
    const prevQuery = this.#currentQuery;
    const prevOptions = this.options;
    const prevResult = this.#currentResult;
    const prevResultState = this.#currentResultState;
    const prevResultOptions = this.#currentResultOptions;
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : this.#currentQueryInitialState;
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          this.#lastQueryWithDefinedData?.state.data,
          this.#lastQueryWithDefinedData
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult?.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) {
        data = this.#selectResult;
      } else {
        try {
          this.#selectFn = options.select;
          data = options.select(data);
          data = replaceData(prevResult?.data, data, options);
          this.#selectResult = data;
          this.#selectError = null;
        } catch (selectError) {
          this.#selectError = selectError;
        }
      }
    }
    if (this.#selectError) {
      error = this.#selectError;
      data = this.#selectResult;
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: newState.dataUpdateCount > 0 || newState.errorUpdateCount > 0,
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: this.#currentThenable
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const finalizeThenableIfPossible = (thenable) => {
        if (nextResult.status === "error") {
          thenable.reject(nextResult.error);
        } else if (nextResult.data !== void 0) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = this.#currentThenable = nextResult.promise = pendingThenable();
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = this.#currentThenable;
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (nextResult.status === "error" || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (nextResult.status !== "error" || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = this.#currentResult;
    const nextResult = this.createResult(this.#currentQuery, this.options);
    this.#currentResultState = this.#currentQuery.state;
    this.#currentResultOptions = this.options;
    if (this.#currentResultState.data !== void 0) {
      this.#lastQueryWithDefinedData = this.#currentQuery;
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    this.#currentResult = nextResult;
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? this.#trackedProps
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(this.#currentResult).some((key) => {
        const typedKey = key;
        const changed = this.#currentResult[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    this.#notify({ listeners: shouldNotifyListeners() });
  }
  #updateQuery() {
    const query = this.#client.getQueryCache().build(this.#client, this.options);
    if (query === this.#currentQuery) {
      return;
    }
    const prevQuery = this.#currentQuery;
    this.#currentQuery = query;
    this.#currentQueryInitialState = query.state;
    if (this.hasListeners()) {
      prevQuery?.removeObserver(this);
      query.addObserver(this);
    }
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      this.#updateTimers();
    }
  }
  #notify(notifyOptions) {
    notifyManager.batch(() => {
      if (notifyOptions.listeners) {
        this.listeners.forEach((listener) => {
          listener(this.#currentResult);
        });
      }
      this.#client.getQueryCache().notify({
        query: this.#currentQuery,
        type: "observerResultsUpdated"
      });
    });
  }
};
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}

// ../node_modules/@tanstack/query-core/build/modern/queriesObserver.js
function difference(array1, array2) {
  const excludeSet = new Set(array2);
  return array1.filter((x) => !excludeSet.has(x));
}
function replaceAt(array, index, value) {
  const copy = array.slice(0);
  copy[index] = value;
  return copy;
}
var QueriesObserver = class extends Subscribable {
  #client;
  #result;
  #queries;
  #options;
  #observers;
  #combinedResult;
  #lastCombine;
  #lastResult;
  #observerMatches = [];
  constructor(client, queries, options) {
    super();
    this.#client = client;
    this.#options = options;
    this.#queries = [];
    this.#observers = [];
    this.#result = [];
    this.setQueries(queries);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      this.#observers.forEach((observer) => {
        observer.subscribe((result) => {
          this.#onUpdate(observer, result);
        });
      });
    }
  }
  onUnsubscribe() {
    if (!this.listeners.size) {
      this.destroy();
    }
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    this.#observers.forEach((observer) => {
      observer.destroy();
    });
  }
  setQueries(queries, options) {
    this.#queries = queries;
    this.#options = options;
    if (true) {
      const queryHashes = queries.map(
        (query) => this.#client.defaultQueryOptions(query).queryHash
      );
      if (new Set(queryHashes).size !== queryHashes.length) {
        console.warn(
          "[QueriesObserver]: Duplicate Queries found. This might result in unexpected behavior."
        );
      }
    }
    notifyManager.batch(() => {
      const prevObservers = this.#observers;
      const newObserverMatches = this.#findMatchingObservers(this.#queries);
      this.#observerMatches = newObserverMatches;
      newObserverMatches.forEach(
        (match) => match.observer.setOptions(match.defaultedQueryOptions)
      );
      const newObservers = newObserverMatches.map((match) => match.observer);
      const newResult = newObservers.map(
        (observer) => observer.getCurrentResult()
      );
      const hasIndexChange = newObservers.some(
        (observer, index) => observer !== prevObservers[index]
      );
      if (prevObservers.length === newObservers.length && !hasIndexChange) {
        return;
      }
      this.#observers = newObservers;
      this.#result = newResult;
      if (!this.hasListeners()) {
        return;
      }
      difference(prevObservers, newObservers).forEach((observer) => {
        observer.destroy();
      });
      difference(newObservers, prevObservers).forEach((observer) => {
        observer.subscribe((result) => {
          this.#onUpdate(observer, result);
        });
      });
      this.#notify();
    });
  }
  getCurrentResult() {
    return this.#result;
  }
  getQueries() {
    return this.#observers.map((observer) => observer.getCurrentQuery());
  }
  getObservers() {
    return this.#observers;
  }
  getOptimisticResult(queries, combine) {
    const matches = this.#findMatchingObservers(queries);
    const result = matches.map(
      (match) => match.observer.getOptimisticResult(match.defaultedQueryOptions)
    );
    return [
      result,
      (r) => {
        return this.#combineResult(r ?? result, combine);
      },
      () => {
        return this.#trackResult(result, matches);
      }
    ];
  }
  #trackResult(result, matches) {
    return matches.map((match, index) => {
      const observerResult = result[index];
      return !match.defaultedQueryOptions.notifyOnChangeProps ? match.observer.trackResult(observerResult, (accessedProp) => {
        matches.forEach((m) => {
          m.observer.trackProp(accessedProp);
        });
      }) : observerResult;
    });
  }
  #combineResult(input, combine) {
    if (combine) {
      if (!this.#combinedResult || this.#result !== this.#lastResult || combine !== this.#lastCombine) {
        this.#lastCombine = combine;
        this.#lastResult = this.#result;
        this.#combinedResult = replaceEqualDeep(
          this.#combinedResult,
          combine(input)
        );
      }
      return this.#combinedResult;
    }
    return input;
  }
  #findMatchingObservers(queries) {
    const prevObserversMap = new Map(
      this.#observers.map((observer) => [observer.options.queryHash, observer])
    );
    const observers = [];
    queries.forEach((options) => {
      const defaultedOptions = this.#client.defaultQueryOptions(options);
      const match = prevObserversMap.get(defaultedOptions.queryHash);
      if (match) {
        observers.push({
          defaultedQueryOptions: defaultedOptions,
          observer: match
        });
      } else {
        observers.push({
          defaultedQueryOptions: defaultedOptions,
          observer: new QueryObserver(this.#client, defaultedOptions)
        });
      }
    });
    return observers;
  }
  #onUpdate(observer, result) {
    const index = this.#observers.indexOf(observer);
    if (index !== -1) {
      this.#result = replaceAt(this.#result, index, result);
      this.#notify();
    }
  }
  #notify() {
    if (this.hasListeners()) {
      const previousResult = this.#combinedResult;
      const newTracked = this.#trackResult(this.#result, this.#observerMatches);
      const newResult = this.#combineResult(newTracked, this.#options?.combine);
      if (previousResult !== newResult) {
        notifyManager.batch(() => {
          this.listeners.forEach((listener) => {
            listener(this.#result);
          });
        });
      }
    }
  }
};

// ../node_modules/@tanstack/query-core/build/modern/infiniteQueryObserver.js
var InfiniteQueryObserver = class extends QueryObserver {
  constructor(client, options) {
    super(client, options);
  }
  bindMethods() {
    super.bindMethods();
    this.fetchNextPage = this.fetchNextPage.bind(this);
    this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
  }
  setOptions(options) {
    super.setOptions({
      ...options,
      behavior: infiniteQueryBehavior()
    });
  }
  getOptimisticResult(options) {
    options.behavior = infiniteQueryBehavior();
    return super.getOptimisticResult(options);
  }
  fetchNextPage(options) {
    return this.fetch({
      ...options,
      meta: {
        fetchMore: { direction: "forward" }
      }
    });
  }
  fetchPreviousPage(options) {
    return this.fetch({
      ...options,
      meta: {
        fetchMore: { direction: "backward" }
      }
    });
  }
  createResult(query, options) {
    const { state } = query;
    const parentResult = super.createResult(query, options);
    const { isFetching, isRefetching, isError, isRefetchError } = parentResult;
    const fetchDirection = state.fetchMeta?.fetchMore?.direction;
    const isFetchNextPageError = isError && fetchDirection === "forward";
    const isFetchingNextPage = isFetching && fetchDirection === "forward";
    const isFetchPreviousPageError = isError && fetchDirection === "backward";
    const isFetchingPreviousPage = isFetching && fetchDirection === "backward";
    const result = {
      ...parentResult,
      fetchNextPage: this.fetchNextPage,
      fetchPreviousPage: this.fetchPreviousPage,
      hasNextPage: hasNextPage(options, state.data),
      hasPreviousPage: hasPreviousPage(options, state.data),
      isFetchNextPageError,
      isFetchingNextPage,
      isFetchPreviousPageError,
      isFetchingPreviousPage,
      isRefetchError: isRefetchError && !isFetchNextPageError && !isFetchPreviousPageError,
      isRefetching: isRefetching && !isFetchingNextPage && !isFetchingPreviousPage
    };
    return result;
  }
};

// ../node_modules/@tanstack/query-core/build/modern/mutationObserver.js
var MutationObserver = class extends Subscribable {
  #client;
  #currentResult = void 0;
  #currentMutation;
  #mutateOptions;
  constructor(client, options) {
    super();
    this.#client = client;
    this.setOptions(options);
    this.bindMethods();
    this.#updateResult();
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    this.options = this.#client.defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: this.#currentMutation,
        observer: this
      });
    }
    if (prevOptions?.mutationKey && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (this.#currentMutation?.state.status === "pending") {
      this.#currentMutation.setOptions(this.options);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#currentMutation?.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    this.#updateResult();
    this.#notify(action);
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  reset() {
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = void 0;
    this.#updateResult();
    this.#notify();
  }
  mutate(variables, options) {
    this.#mutateOptions = options;
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = this.#client.getMutationCache().build(this.#client, this.options);
    this.#currentMutation.addObserver(this);
    return this.#currentMutation.execute(variables);
  }
  #updateResult() {
    const state = this.#currentMutation?.state ?? getDefaultState2();
    this.#currentResult = {
      ...state,
      isPending: state.status === "pending",
      isSuccess: state.status === "success",
      isError: state.status === "error",
      isIdle: state.status === "idle",
      mutate: this.mutate,
      reset: this.reset
    };
  }
  #notify(action) {
    notifyManager.batch(() => {
      if (this.#mutateOptions && this.hasListeners()) {
        const variables = this.#currentResult.variables;
        const context = this.#currentResult.context;
        if (action?.type === "success") {
          this.#mutateOptions.onSuccess?.(action.data, variables, context);
          this.#mutateOptions.onSettled?.(action.data, null, variables, context);
        } else if (action?.type === "error") {
          this.#mutateOptions.onError?.(action.error, variables, context);
          this.#mutateOptions.onSettled?.(
            void 0,
            action.error,
            variables,
            context
          );
        }
      }
      this.listeners.forEach((listener) => {
        listener(this.#currentResult);
      });
    });
  }
};

// ../node_modules/@tanstack/react-query/build/modern/useQueries.js
var React5 = __toESM(require_react(), 1);

// ../node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var QueryClientContext = React.createContext(
  void 0
);
var useQueryClient = (queryClient) => {
  const client = React.useContext(QueryClientContext);
  if (queryClient) {
    return queryClient;
  }
  if (!client) {
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  }
  return client;
};
var QueryClientProvider = ({
  client,
  children
}) => {
  React.useEffect(() => {
    client.mount();
    return () => {
      client.unmount();
    };
  }, [client]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientContext.Provider, { value: client, children });
};

// ../node_modules/@tanstack/react-query/build/modern/IsRestoringProvider.js
var React2 = __toESM(require_react(), 1);
var IsRestoringContext = React2.createContext(false);
var useIsRestoring = () => React2.useContext(IsRestoringContext);
var IsRestoringProvider = IsRestoringContext.Provider;

// ../node_modules/@tanstack/react-query/build/modern/QueryErrorResetBoundary.js
var React3 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = React3.createContext(createValue());
var useQueryErrorResetBoundary = () => React3.useContext(QueryErrorResetBoundaryContext);

// ../node_modules/@tanstack/react-query/build/modern/errorBoundaryUtils.js
var React4 = __toESM(require_react(), 1);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary) => {
  if (options.suspense || options.throwOnError || options.experimental_prefetchInRender) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  React4.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};

// ../node_modules/@tanstack/react-query/build/modern/suspense.js
var defaultThrowOnError = (_error, query) => query.state.data === void 0;
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const clamp = (value) => value === "static" ? value : Math.max(value ?? 1e3, 1e3);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(defaultedOptions.gcTime, 1e3);
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});

// ../node_modules/@tanstack/react-query/build/modern/useQueries.js
function useQueries({
  queries,
  ...options
}, queryClient) {
  const client = useQueryClient(queryClient);
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const defaultedQueries = React5.useMemo(
    () => queries.map((opts) => {
      const defaultedOptions = client.defaultQueryOptions(
        opts
      );
      defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
      return defaultedOptions;
    }),
    [queries, client, isRestoring]
  );
  defaultedQueries.forEach((query) => {
    ensureSuspenseTimers(query);
    ensurePreventErrorBoundaryRetry(query, errorResetBoundary);
  });
  useClearResetErrorBoundary(errorResetBoundary);
  const [observer] = React5.useState(
    () => new QueriesObserver(
      client,
      defaultedQueries,
      options
    )
  );
  const [optimisticResult, getCombinedResult, trackResult2] = observer.getOptimisticResult(
    defaultedQueries,
    options.combine
  );
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  React5.useSyncExternalStore(
    React5.useCallback(
      (onStoreChange) => shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop,
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  React5.useEffect(() => {
    observer.setQueries(
      defaultedQueries,
      options
    );
  }, [defaultedQueries, options, observer]);
  const shouldAtLeastOneSuspend = optimisticResult.some(
    (result, index) => shouldSuspend(defaultedQueries[index], result)
  );
  const suspensePromises = shouldAtLeastOneSuspend ? optimisticResult.flatMap((result, index) => {
    const opts = defaultedQueries[index];
    if (opts) {
      const queryObserver = new QueryObserver(client, opts);
      if (shouldSuspend(opts, result)) {
        return fetchOptimistic(opts, queryObserver, errorResetBoundary);
      } else if (willFetch(result, isRestoring)) {
        void fetchOptimistic(opts, queryObserver, errorResetBoundary);
      }
    }
    return [];
  }) : [];
  if (suspensePromises.length > 0) {
    throw Promise.all(suspensePromises);
  }
  const firstSingleResultWhichShouldThrow = optimisticResult.find(
    (result, index) => {
      const query = defaultedQueries[index];
      return query && getHasError({
        result,
        errorResetBoundary,
        throwOnError: query.throwOnError,
        query: client.getQueryCache().get(query.queryHash),
        suspense: query.suspense
      });
    }
  );
  if (firstSingleResultWhichShouldThrow?.error) {
    throw firstSingleResultWhichShouldThrow.error;
  }
  return getCombinedResult(trackResult2());
}

// ../node_modules/@tanstack/react-query/build/modern/useBaseQuery.js
var React6 = __toESM(require_react(), 1);
function useBaseQuery(options, Observer, queryClient) {
  if (true) {
    if (typeof options !== "object" || Array.isArray(options)) {
      throw new Error(
        'Bad argument type. Starting with v5, only the "Object" form is allowed when calling query related functions. Please use the error stack to find the culprit call. More info here: https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5#supports-a-single-signature-one-object'
      );
    }
  }
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient(queryClient);
  const defaultedOptions = client.defaultQueryOptions(options);
  client.getDefaultOptions().queries?._experimental_beforeQuery?.(
    defaultedOptions
  );
  if (true) {
    if (!defaultedOptions.queryFn) {
      console.error(
        `[${defaultedOptions.queryHash}]: No queryFn was passed as an option, and no default queryFn was found. The queryFn parameter is only optional when using a default queryFn. More info here: https://tanstack.com/query/latest/docs/framework/react/guides/default-query-function`
      );
    }
  }
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = React6.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  React6.useSyncExternalStore(
    React6.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  React6.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query: client.getQueryCache().get(defaultedOptions.queryHash),
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  ;
  client.getDefaultOptions().queries?._experimental_afterQuery?.(
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !isServer && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      client.getQueryCache().get(defaultedOptions.queryHash)?.promise
    );
    promise?.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}

// ../node_modules/@tanstack/react-query/build/modern/useQuery.js
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver, queryClient);
}

// ../node_modules/@tanstack/react-query/build/modern/useSuspenseQuery.js
function useSuspenseQuery(options, queryClient) {
  if (true) {
    if (options.queryFn === skipToken) {
      console.error("skipToken is not allowed for useSuspenseQuery");
    }
  }
  return useBaseQuery(
    {
      ...options,
      enabled: true,
      suspense: true,
      throwOnError: defaultThrowOnError,
      placeholderData: void 0
    },
    QueryObserver,
    queryClient
  );
}

// ../node_modules/@tanstack/react-query/build/modern/useSuspenseInfiniteQuery.js
function useSuspenseInfiniteQuery(options, queryClient) {
  if (true) {
    if (options.queryFn === skipToken) {
      console.error("skipToken is not allowed for useSuspenseInfiniteQuery");
    }
  }
  return useBaseQuery(
    {
      ...options,
      enabled: true,
      suspense: true,
      throwOnError: defaultThrowOnError
    },
    InfiniteQueryObserver,
    queryClient
  );
}

// ../node_modules/@tanstack/react-query/build/modern/useSuspenseQueries.js
function useSuspenseQueries(options, queryClient) {
  return useQueries(
    {
      ...options,
      queries: options.queries.map((query) => {
        if (true) {
          if (query.queryFn === skipToken) {
            console.error("skipToken is not allowed for useSuspenseQueries");
          }
        }
        return {
          ...query,
          suspense: true,
          throwOnError: defaultThrowOnError,
          enabled: true,
          placeholderData: void 0
        };
      })
    },
    queryClient
  );
}

// ../node_modules/@tanstack/react-query/build/modern/usePrefetchQuery.js
function usePrefetchQuery(options, queryClient) {
  const client = useQueryClient(queryClient);
  if (!client.getQueryState(options.queryKey)) {
    client.prefetchQuery(options);
  }
}

// ../node_modules/@tanstack/react-query/build/modern/usePrefetchInfiniteQuery.js
function usePrefetchInfiniteQuery(options, queryClient) {
  const client = useQueryClient(queryClient);
  if (!client.getQueryState(options.queryKey)) {
    client.prefetchInfiniteQuery(options);
  }
}

// ../node_modules/@tanstack/react-query/build/modern/queryOptions.js
function queryOptions(options) {
  return options;
}

// ../node_modules/@tanstack/react-query/build/modern/infiniteQueryOptions.js
function infiniteQueryOptions(options) {
  return options;
}

// ../node_modules/@tanstack/react-query/build/modern/useMutation.js
var React7 = __toESM(require_react(), 1);
function useMutation(options, queryClient) {
  const client = useQueryClient(queryClient);
  const [observer] = React7.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  React7.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = React7.useSyncExternalStore(
    React7.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = React7.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}

// ../node_modules/@tanstack/react-query/build/modern/useInfiniteQuery.js
function useInfiniteQuery(options, queryClient) {
  return useBaseQuery(
    options,
    InfiniteQueryObserver,
    queryClient
  );
}

// ../node_modules/@trpc/server/dist/utils-DdbbrDku.mjs
var TRPC_ERROR_CODES_BY_KEY = {
  PARSE_ERROR: -32700,
  BAD_REQUEST: -32600,
  INTERNAL_SERVER_ERROR: -32603,
  NOT_IMPLEMENTED: -32603,
  BAD_GATEWAY: -32603,
  SERVICE_UNAVAILABLE: -32603,
  GATEWAY_TIMEOUT: -32603,
  UNAUTHORIZED: -32001,
  PAYMENT_REQUIRED: -32002,
  FORBIDDEN: -32003,
  NOT_FOUND: -32004,
  METHOD_NOT_SUPPORTED: -32005,
  TIMEOUT: -32008,
  CONFLICT: -32009,
  PRECONDITION_FAILED: -32012,
  PAYLOAD_TOO_LARGE: -32013,
  UNSUPPORTED_MEDIA_TYPE: -32015,
  UNPROCESSABLE_CONTENT: -32022,
  TOO_MANY_REQUESTS: -32029,
  CLIENT_CLOSED_REQUEST: -32099
};
var retryableRpcCodes = [
  TRPC_ERROR_CODES_BY_KEY.BAD_GATEWAY,
  TRPC_ERROR_CODES_BY_KEY.SERVICE_UNAVAILABLE,
  TRPC_ERROR_CODES_BY_KEY.GATEWAY_TIMEOUT,
  TRPC_ERROR_CODES_BY_KEY.INTERNAL_SERVER_ERROR
];
function isObject(value) {
  return !!value && !Array.isArray(value) && typeof value === "object";
}
var asyncIteratorsSupported = typeof Symbol === "function" && !!Symbol.asyncIterator;
function isAsyncIterable(value) {
  return asyncIteratorsSupported && isObject(value) && Symbol.asyncIterator in value;
}

// ../node_modules/@trpc/server/dist/getErrorShape-Uhlrl4Bk.mjs
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
    key = keys[i];
    if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
      get: ((k) => from[k]).bind(null, key),
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    });
  }
  return to;
};
var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
  value: mod,
  enumerable: true
}) : target, mod));
var noop2 = () => {
};
var freezeIfAvailable = (obj) => {
  if (Object.freeze) Object.freeze(obj);
};
function createInnerProxy(callback, path, memo) {
  var _memo$cacheKey;
  const cacheKey = path.join(".");
  (_memo$cacheKey = memo[cacheKey]) !== null && _memo$cacheKey !== void 0 || (memo[cacheKey] = new Proxy(noop2, {
    get(_obj, key) {
      if (typeof key !== "string" || key === "then") return void 0;
      return createInnerProxy(callback, [...path, key], memo);
    },
    apply(_1, _2, args) {
      const lastOfPath = path[path.length - 1];
      let opts = {
        args,
        path
      };
      if (lastOfPath === "call") opts = {
        args: args.length >= 2 ? [args[1]] : [],
        path: path.slice(0, -1)
      };
      else if (lastOfPath === "apply") opts = {
        args: args.length >= 2 ? args[1] : [],
        path: path.slice(0, -1)
      };
      freezeIfAvailable(opts.args);
      freezeIfAvailable(opts.path);
      return callback(opts);
    }
  }));
  return memo[cacheKey];
}
var createRecursiveProxy = (callback) => createInnerProxy(callback, [], /* @__PURE__ */ Object.create(null));
var createFlatProxy = (callback) => {
  return new Proxy(noop2, { get(_obj, name) {
    if (name === "then") return void 0;
    return callback(name);
  } });
};
var require_typeof = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/typeof.js"(exports, module) {
  function _typeof$2(o) {
    "@babel/helpers - typeof";
    return module.exports = _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
      return typeof o$1;
    } : function(o$1) {
      return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof$2(o);
  }
  module.exports = _typeof$2, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_toPrimitive = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/toPrimitive.js"(exports, module) {
  var _typeof$1 = require_typeof()["default"];
  function toPrimitive$1(t, r) {
    if ("object" != _typeof$1(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof$1(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  module.exports = toPrimitive$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_toPropertyKey = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/toPropertyKey.js"(exports, module) {
  var _typeof = require_typeof()["default"];
  var toPrimitive = require_toPrimitive();
  function toPropertyKey$1(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  module.exports = toPropertyKey$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_defineProperty = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/defineProperty.js"(exports, module) {
  var toPropertyKey = require_toPropertyKey();
  function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_objectSpread2 = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/objectSpread2.js"(exports, module) {
  var defineProperty = require_defineProperty();
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r$1) {
        return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r$1) {
        defineProperty(e, r$1, t[r$1]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
        Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
      });
    }
    return e;
  }
  module.exports = _objectSpread2, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var import_objectSpread2 = __toESM2(require_objectSpread2(), 1);

// ../node_modules/@trpc/server/dist/tracked-gU3ttYjg.mjs
var import_defineProperty = __toESM2(require_defineProperty(), 1);
var import_objectSpread2$1 = __toESM2(require_objectSpread2(), 1);
function transformResultInner(response, transformer) {
  if ("error" in response) {
    const error = transformer.deserialize(response.error);
    return {
      ok: false,
      error: (0, import_objectSpread2$1.default)((0, import_objectSpread2$1.default)({}, response), {}, { error })
    };
  }
  const result = (0, import_objectSpread2$1.default)((0, import_objectSpread2$1.default)({}, response.result), (!response.result.type || response.result.type === "data") && {
    type: "data",
    data: transformer.deserialize(response.result.data)
  });
  return {
    ok: true,
    result
  };
}
var TransformResultError = class extends Error {
  constructor() {
    super("Unable to transform response from server");
  }
};
function transformResult(response, transformer) {
  let result;
  try {
    result = transformResultInner(response, transformer);
  } catch (_unused) {
    throw new TransformResultError();
  }
  if (!result.ok && (!isObject(result.error.error) || typeof result.error.error["code"] !== "number")) throw new TransformResultError();
  if (result.ok && !isObject(result.result)) throw new TransformResultError();
  return result;
}
var import_objectSpread22 = __toESM2(require_objectSpread2(), 1);
var lazySymbol = Symbol("lazy");
var trackedSymbol = Symbol();

// ../node_modules/@trpc/server/dist/observable-UMO3vUa_.mjs
function observable(subscribe) {
  const self = {
    subscribe(observer) {
      let teardownRef = null;
      let isDone = false;
      let unsubscribed = false;
      let teardownImmediately = false;
      function unsubscribe() {
        if (teardownRef === null) {
          teardownImmediately = true;
          return;
        }
        if (unsubscribed) return;
        unsubscribed = true;
        if (typeof teardownRef === "function") teardownRef();
        else if (teardownRef) teardownRef.unsubscribe();
      }
      teardownRef = subscribe({
        next(value) {
          var _observer$next;
          if (isDone) return;
          (_observer$next = observer.next) === null || _observer$next === void 0 || _observer$next.call(observer, value);
        },
        error(err) {
          var _observer$error;
          if (isDone) return;
          isDone = true;
          (_observer$error = observer.error) === null || _observer$error === void 0 || _observer$error.call(observer, err);
          unsubscribe();
        },
        complete() {
          var _observer$complete;
          if (isDone) return;
          isDone = true;
          (_observer$complete = observer.complete) === null || _observer$complete === void 0 || _observer$complete.call(observer);
          unsubscribe();
        }
      });
      if (teardownImmediately) unsubscribe();
      return { unsubscribe };
    },
    pipe(...operations) {
      return operations.reduce(pipeReducer, self);
    }
  };
  return self;
}
function pipeReducer(prev, fn) {
  return fn(prev);
}
function observableToPromise(observable$1) {
  const ac = new AbortController();
  const promise = new Promise((resolve, reject) => {
    let isDone = false;
    function onDone() {
      if (isDone) return;
      isDone = true;
      obs$.unsubscribe();
    }
    ac.signal.addEventListener("abort", () => {
      reject(ac.signal.reason);
    });
    const obs$ = observable$1.subscribe({
      next(data) {
        isDone = true;
        resolve(data);
        onDone();
      },
      error(data) {
        reject(data);
      },
      complete() {
        ac.abort();
        onDone();
      }
    });
  });
  return promise;
}

// ../node_modules/@trpc/react-query/dist/getQueryKey-BY58RNzP.mjs
var __create2 = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __getProtoOf2 = Object.getPrototypeOf;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __commonJS2 = (cb, mod) => function() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames2(from), i = 0, n = keys.length, key; i < n; i++) {
    key = keys[i];
    if (!__hasOwnProp2.call(to, key) && key !== except) __defProp2(to, key, {
      get: ((k) => from[k]).bind(null, key),
      enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable
    });
  }
  return to;
};
var __toESM3 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", {
  value: mod,
  enumerable: true
}) : target, mod));
var require_objectWithoutPropertiesLoose = __commonJS2({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/objectWithoutPropertiesLoose.js"(exports, module) {
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (e.includes(n)) continue;
      t[n] = r[n];
    }
    return t;
  }
  module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_objectWithoutProperties = __commonJS2({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/objectWithoutProperties.js"(exports, module) {
  var objectWithoutPropertiesLoose = require_objectWithoutPropertiesLoose();
  function _objectWithoutProperties$1(e, t) {
    if (null == e) return {};
    var o, r, i = objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var s = Object.getOwnPropertySymbols(e);
      for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  module.exports = _objectWithoutProperties$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_typeof2 = __commonJS2({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/typeof.js"(exports, module) {
  function _typeof$2(o) {
    "@babel/helpers - typeof";
    return module.exports = _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
      return typeof o$1;
    } : function(o$1) {
      return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof$2(o);
  }
  module.exports = _typeof$2, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_toPrimitive2 = __commonJS2({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/toPrimitive.js"(exports, module) {
  var _typeof$1 = require_typeof2()["default"];
  function toPrimitive$1(t, r) {
    if ("object" != _typeof$1(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof$1(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  module.exports = toPrimitive$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_toPropertyKey2 = __commonJS2({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/toPropertyKey.js"(exports, module) {
  var _typeof = require_typeof2()["default"];
  var toPrimitive = require_toPrimitive2();
  function toPropertyKey$1(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  module.exports = toPropertyKey$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_defineProperty2 = __commonJS2({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/defineProperty.js"(exports, module) {
  var toPropertyKey = require_toPropertyKey2();
  function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_objectSpread22 = __commonJS2({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/objectSpread2.js"(exports, module) {
  var defineProperty = require_defineProperty2();
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r$1) {
        return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r$1) {
        defineProperty(e, r$1, t[r$1]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
        Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
      });
    }
    return e;
  }
  module.exports = _objectSpread2, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var import_objectWithoutProperties = __toESM3(require_objectWithoutProperties(), 1);
var import_objectSpread23 = __toESM3(require_objectSpread22(), 1);
var _excluded = ["cursor", "direction"];
function getQueryKeyInternal(path, input, type) {
  const splitPath = path.flatMap((part) => part.split("."));
  if (!input && (!type || type === "any")) return splitPath.length ? [splitPath] : [];
  if (type === "infinite" && isObject(input) && ("direction" in input || "cursor" in input)) {
    const { cursor: _, direction: __ } = input, inputWithoutCursorAndDirection = (0, import_objectWithoutProperties.default)(input, _excluded);
    return [splitPath, {
      input: inputWithoutCursorAndDirection,
      type: "infinite"
    }];
  }
  return [splitPath, (0, import_objectSpread23.default)((0, import_objectSpread23.default)({}, typeof input !== "undefined" && input !== skipToken && { input }), type && type !== "any" && { type })];
}
function getMutationKeyInternal(path) {
  return getQueryKeyInternal(path, void 0, "any");
}

// ../node_modules/@trpc/client/dist/objectSpread2-BvkFp-_Y.mjs
var __create3 = Object.create;
var __defProp3 = Object.defineProperty;
var __getOwnPropDesc3 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames3 = Object.getOwnPropertyNames;
var __getProtoOf3 = Object.getPrototypeOf;
var __hasOwnProp3 = Object.prototype.hasOwnProperty;
var __commonJS3 = (cb, mod) => function() {
  return mod || (0, cb[__getOwnPropNames3(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps3 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames3(from), i = 0, n = keys.length, key; i < n; i++) {
    key = keys[i];
    if (!__hasOwnProp3.call(to, key) && key !== except) __defProp3(to, key, {
      get: ((k) => from[k]).bind(null, key),
      enumerable: !(desc = __getOwnPropDesc3(from, key)) || desc.enumerable
    });
  }
  return to;
};
var __toESM4 = (mod, isNodeMode, target) => (target = mod != null ? __create3(__getProtoOf3(mod)) : {}, __copyProps3(isNodeMode || !mod || !mod.__esModule ? __defProp3(target, "default", {
  value: mod,
  enumerable: true
}) : target, mod));
var require_typeof3 = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/typeof.js"(exports, module) {
  function _typeof$2(o) {
    "@babel/helpers - typeof";
    return module.exports = _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
      return typeof o$1;
    } : function(o$1) {
      return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof$2(o);
  }
  module.exports = _typeof$2, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_toPrimitive3 = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/toPrimitive.js"(exports, module) {
  var _typeof$1 = require_typeof3()["default"];
  function toPrimitive$1(t, r) {
    if ("object" != _typeof$1(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof$1(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  module.exports = toPrimitive$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_toPropertyKey3 = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/toPropertyKey.js"(exports, module) {
  var _typeof = require_typeof3()["default"];
  var toPrimitive = require_toPrimitive3();
  function toPropertyKey$1(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  module.exports = toPropertyKey$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_defineProperty3 = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/defineProperty.js"(exports, module) {
  var toPropertyKey = require_toPropertyKey3();
  function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_objectSpread23 = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/objectSpread2.js"(exports, module) {
  var defineProperty = require_defineProperty3();
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r$1) {
        return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r$1) {
        defineProperty(e, r$1, t[r$1]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
        Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
      });
    }
    return e;
  }
  module.exports = _objectSpread2, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });

// ../node_modules/@trpc/server/dist/observable-CUiPknO-.mjs
function share(_opts) {
  return (source) => {
    let refCount = 0;
    let subscription = null;
    const observers = [];
    function startIfNeeded() {
      if (subscription) return;
      subscription = source.subscribe({
        next(value) {
          for (const observer of observers) {
            var _observer$next;
            (_observer$next = observer.next) === null || _observer$next === void 0 || _observer$next.call(observer, value);
          }
        },
        error(error) {
          for (const observer of observers) {
            var _observer$error;
            (_observer$error = observer.error) === null || _observer$error === void 0 || _observer$error.call(observer, error);
          }
        },
        complete() {
          for (const observer of observers) {
            var _observer$complete;
            (_observer$complete = observer.complete) === null || _observer$complete === void 0 || _observer$complete.call(observer);
          }
        }
      });
    }
    function resetIfNeeded() {
      if (refCount === 0 && subscription) {
        const _sub = subscription;
        subscription = null;
        _sub.unsubscribe();
      }
    }
    return observable((subscriber) => {
      refCount++;
      observers.push(subscriber);
      startIfNeeded();
      return { unsubscribe() {
        refCount--;
        resetIfNeeded();
        const index = observers.findIndex((v) => v === subscriber);
        if (index > -1) observers.splice(index, 1);
      } };
    });
  };
}
function tap(observer) {
  return (source) => {
    return observable((destination) => {
      return source.subscribe({
        next(value) {
          var _observer$next2;
          (_observer$next2 = observer.next) === null || _observer$next2 === void 0 || _observer$next2.call(observer, value);
          destination.next(value);
        },
        error(error) {
          var _observer$error2;
          (_observer$error2 = observer.error) === null || _observer$error2 === void 0 || _observer$error2.call(observer, error);
          destination.error(error);
        },
        complete() {
          var _observer$complete2;
          (_observer$complete2 = observer.complete) === null || _observer$complete2 === void 0 || _observer$complete2.call(observer);
          destination.complete();
        }
      });
    });
  };
}
var distinctUnsetMarker = Symbol();
function behaviorSubject(initialValue) {
  let value = initialValue;
  const observerList = [];
  const addObserver = (observer) => {
    if (value !== void 0) observer.next(value);
    observerList.push(observer);
  };
  const removeObserver = (observer) => {
    observerList.splice(observerList.indexOf(observer), 1);
  };
  const obs = observable((observer) => {
    addObserver(observer);
    return () => {
      removeObserver(observer);
    };
  });
  obs.next = (nextValue) => {
    if (value === nextValue) return;
    value = nextValue;
    for (const observer of observerList) observer.next(nextValue);
  };
  obs.get = () => value;
  return obs;
}

// ../node_modules/@trpc/client/dist/splitLink-B7Cuf2c_.mjs
function createChain(opts) {
  return observable((observer) => {
    function execute(index = 0, op = opts.op) {
      const next = opts.links[index];
      if (!next) throw new Error("No more links to execute - did you forget to add an ending link?");
      const subscription = next({
        op,
        next(nextOp) {
          const nextObserver = execute(index + 1, nextOp);
          return nextObserver;
        }
      });
      return subscription;
    }
    const obs$ = execute();
    return obs$.subscribe(observer);
  });
}

// ../node_modules/@trpc/client/dist/TRPCClientError-CjKyS10w.mjs
var import_defineProperty2 = __toESM4(require_defineProperty3(), 1);
var import_objectSpread24 = __toESM4(require_objectSpread23(), 1);
function isTRPCClientError(cause) {
  return cause instanceof TRPCClientError;
}
function isTRPCErrorResponse(obj) {
  return isObject(obj) && isObject(obj["error"]) && typeof obj["error"]["code"] === "number" && typeof obj["error"]["message"] === "string";
}
function getMessageFromUnknownError(err, fallback) {
  if (typeof err === "string") return err;
  if (isObject(err) && typeof err["message"] === "string") return err["message"];
  return fallback;
}
var TRPCClientError = class TRPCClientError2 extends Error {
  constructor(message, opts) {
    var _opts$result, _opts$result2;
    const cause = opts === null || opts === void 0 ? void 0 : opts.cause;
    super(message, { cause });
    (0, import_defineProperty2.default)(this, "cause", void 0);
    (0, import_defineProperty2.default)(this, "shape", void 0);
    (0, import_defineProperty2.default)(this, "data", void 0);
    (0, import_defineProperty2.default)(this, "meta", void 0);
    this.meta = opts === null || opts === void 0 ? void 0 : opts.meta;
    this.cause = cause;
    this.shape = opts === null || opts === void 0 || (_opts$result = opts.result) === null || _opts$result === void 0 ? void 0 : _opts$result.error;
    this.data = opts === null || opts === void 0 || (_opts$result2 = opts.result) === null || _opts$result2 === void 0 ? void 0 : _opts$result2.error.data;
    this.name = "TRPCClientError";
    Object.setPrototypeOf(this, TRPCClientError2.prototype);
  }
  static from(_cause, opts = {}) {
    const cause = _cause;
    if (isTRPCClientError(cause)) {
      if (opts.meta) cause.meta = (0, import_objectSpread24.default)((0, import_objectSpread24.default)({}, cause.meta), opts.meta);
      return cause;
    }
    if (isTRPCErrorResponse(cause)) return new TRPCClientError2(cause.error.message, (0, import_objectSpread24.default)((0, import_objectSpread24.default)({}, opts), {}, { result: cause }));
    return new TRPCClientError2(getMessageFromUnknownError(cause, "Unknown error"), (0, import_objectSpread24.default)((0, import_objectSpread24.default)({}, opts), {}, { cause }));
  }
};

// ../node_modules/@trpc/client/dist/unstable-internals-Bg7n9BBj.mjs
function getTransformer(transformer) {
  const _transformer = transformer;
  if (!_transformer) return {
    input: {
      serialize: (data) => data,
      deserialize: (data) => data
    },
    output: {
      serialize: (data) => data,
      deserialize: (data) => data
    }
  };
  if ("input" in _transformer) return _transformer;
  return {
    input: _transformer,
    output: _transformer
  };
}

// ../node_modules/@trpc/client/dist/httpUtils-Bkv1johT.mjs
var isFunction2 = (fn) => typeof fn === "function";
function getFetch(customFetchImpl) {
  if (customFetchImpl) return customFetchImpl;
  if (typeof window !== "undefined" && isFunction2(window.fetch)) return window.fetch;
  if (typeof globalThis !== "undefined" && isFunction2(globalThis.fetch)) return globalThis.fetch;
  throw new Error("No fetch implementation found");
}
var import_objectSpread25 = __toESM4(require_objectSpread23(), 1);
function resolveHTTPLinkOptions(opts) {
  return {
    url: opts.url.toString(),
    fetch: opts.fetch,
    transformer: getTransformer(opts.transformer),
    methodOverride: opts.methodOverride
  };
}
function arrayToDict(array) {
  const dict = {};
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    dict[index] = element;
  }
  return dict;
}
var METHOD = {
  query: "GET",
  mutation: "POST",
  subscription: "PATCH"
};
function getInput(opts) {
  return "input" in opts ? opts.transformer.input.serialize(opts.input) : arrayToDict(opts.inputs.map((_input) => opts.transformer.input.serialize(_input)));
}
var getUrl = (opts) => {
  const parts = opts.url.split("?");
  const base = parts[0].replace(/\/$/, "");
  let url = base + "/" + opts.path;
  const queryParts = [];
  if (parts[1]) queryParts.push(parts[1]);
  if ("inputs" in opts) queryParts.push("batch=1");
  if (opts.type === "query" || opts.type === "subscription") {
    const input = getInput(opts);
    if (input !== void 0 && opts.methodOverride !== "POST") queryParts.push(`input=${encodeURIComponent(JSON.stringify(input))}`);
  }
  if (queryParts.length) url += "?" + queryParts.join("&");
  return url;
};
var getBody = (opts) => {
  if (opts.type === "query" && opts.methodOverride !== "POST") return void 0;
  const input = getInput(opts);
  return input !== void 0 ? JSON.stringify(input) : void 0;
};
var jsonHttpRequester = (opts) => {
  return httpRequest((0, import_objectSpread25.default)((0, import_objectSpread25.default)({}, opts), {}, {
    contentTypeHeader: "application/json",
    getUrl,
    getBody
  }));
};
var AbortError = class extends Error {
  constructor() {
    const name = "AbortError";
    super(name);
    this.name = name;
    this.message = name;
  }
};
var throwIfAborted = (signal) => {
  var _signal$throwIfAborte;
  if (!(signal === null || signal === void 0 ? void 0 : signal.aborted)) return;
  (_signal$throwIfAborte = signal.throwIfAborted) === null || _signal$throwIfAborte === void 0 || _signal$throwIfAborte.call(signal);
  if (typeof DOMException !== "undefined") throw new DOMException("AbortError", "AbortError");
  throw new AbortError();
};
async function fetchHTTPResponse(opts) {
  var _opts$methodOverride;
  throwIfAborted(opts.signal);
  const url = opts.getUrl(opts);
  const body = opts.getBody(opts);
  const { type } = opts;
  const resolvedHeaders = await (async () => {
    const heads = await opts.headers();
    if (Symbol.iterator in heads) return Object.fromEntries(heads);
    return heads;
  })();
  const headers = (0, import_objectSpread25.default)((0, import_objectSpread25.default)((0, import_objectSpread25.default)({}, opts.contentTypeHeader ? { "content-type": opts.contentTypeHeader } : {}), opts.trpcAcceptHeader ? { "trpc-accept": opts.trpcAcceptHeader } : void 0), resolvedHeaders);
  return getFetch(opts.fetch)(url, {
    method: (_opts$methodOverride = opts.methodOverride) !== null && _opts$methodOverride !== void 0 ? _opts$methodOverride : METHOD[type],
    signal: opts.signal,
    body,
    headers
  });
}
async function httpRequest(opts) {
  const meta = {};
  const res = await fetchHTTPResponse(opts);
  meta.response = res;
  const json = await res.json();
  meta.responseJSON = json;
  return {
    json,
    meta
  };
}

// ../node_modules/@trpc/client/dist/httpLink-CYOcG9kQ.mjs
function isOctetType(input) {
  return input instanceof Uint8Array || input instanceof Blob;
}
function isFormData(input) {
  return input instanceof FormData;
}
var import_objectSpread26 = __toESM4(require_objectSpread23(), 1);
var universalRequester = (opts) => {
  if ("input" in opts) {
    const { input } = opts;
    if (isFormData(input)) {
      if (opts.type !== "mutation" && opts.methodOverride !== "POST") throw new Error("FormData is only supported for mutations");
      return httpRequest((0, import_objectSpread26.default)((0, import_objectSpread26.default)({}, opts), {}, {
        contentTypeHeader: void 0,
        getUrl,
        getBody: () => input
      }));
    }
    if (isOctetType(input)) {
      if (opts.type !== "mutation" && opts.methodOverride !== "POST") throw new Error("Octet type input is only supported for mutations");
      return httpRequest((0, import_objectSpread26.default)((0, import_objectSpread26.default)({}, opts), {}, {
        contentTypeHeader: "application/octet-stream",
        getUrl,
        getBody: () => input
      }));
    }
  }
  return jsonHttpRequester(opts);
};
function httpLink(opts) {
  const resolvedOpts = resolveHTTPLinkOptions(opts);
  return () => {
    return ({ op }) => {
      return observable((observer) => {
        const { path, input, type } = op;
        if (type === "subscription") throw new Error("Subscriptions are unsupported by `httpLink` - use `httpSubscriptionLink` or `wsLink`");
        const request = universalRequester((0, import_objectSpread26.default)((0, import_objectSpread26.default)({}, resolvedOpts), {}, {
          type,
          path,
          input,
          signal: op.signal,
          headers() {
            if (!opts.headers) return {};
            if (typeof opts.headers === "function") return opts.headers({ op });
            return opts.headers;
          }
        }));
        let meta = void 0;
        request.then((res) => {
          meta = res.meta;
          const transformed = transformResult(res.json, resolvedOpts.transformer.output);
          if (!transformed.ok) {
            observer.error(TRPCClientError.from(transformed.error, { meta }));
            return;
          }
          observer.next({
            context: res.meta,
            result: transformed.result
          });
          observer.complete();
        }).catch((cause) => {
          observer.error(TRPCClientError.from(cause, { meta }));
        });
        return () => {
        };
      });
    };
  };
}

// ../node_modules/@trpc/client/dist/httpBatchLink-CA96-gnJ.mjs
var import_objectSpread27 = __toESM4(require_objectSpread23(), 1);

// ../node_modules/@trpc/client/dist/loggerLink-ineCN1PO.mjs
var import_objectSpread28 = __toESM4(require_objectSpread23(), 1);
function isFormData2(value) {
  if (typeof FormData === "undefined") return false;
  return value instanceof FormData;
}
var palettes = {
  css: {
    query: ["72e3ff", "3fb0d8"],
    mutation: ["c5a3fc", "904dfc"],
    subscription: ["ff49e1", "d83fbe"]
  },
  ansi: {
    regular: {
      query: ["\x1B[30;46m", "\x1B[97;46m"],
      mutation: ["\x1B[30;45m", "\x1B[97;45m"],
      subscription: ["\x1B[30;42m", "\x1B[97;42m"]
    },
    bold: {
      query: ["\x1B[1;30;46m", "\x1B[1;97;46m"],
      mutation: ["\x1B[1;30;45m", "\x1B[1;97;45m"],
      subscription: ["\x1B[1;30;42m", "\x1B[1;97;42m"]
    }
  }
};
function constructPartsAndArgs(opts) {
  const { direction, type, withContext, path, id, input } = opts;
  const parts = [];
  const args = [];
  if (opts.colorMode === "none") parts.push(direction === "up" ? ">>" : "<<", type, `#${id}`, path);
  else if (opts.colorMode === "ansi") {
    const [lightRegular, darkRegular] = palettes.ansi.regular[type];
    const [lightBold, darkBold] = palettes.ansi.bold[type];
    const reset = "\x1B[0m";
    parts.push(direction === "up" ? lightRegular : darkRegular, direction === "up" ? ">>" : "<<", type, direction === "up" ? lightBold : darkBold, `#${id}`, path, reset);
  } else {
    const [light, dark] = palettes.css[type];
    const css = `
    background-color: #${direction === "up" ? light : dark};
    color: ${direction === "up" ? "black" : "white"};
    padding: 2px;
  `;
    parts.push("%c", direction === "up" ? ">>" : "<<", type, `#${id}`, `%c${path}%c`, "%O");
    args.push(css, `${css}; font-weight: bold;`, `${css}; font-weight: normal;`);
  }
  if (direction === "up") args.push(withContext ? {
    input,
    context: opts.context
  } : { input });
  else args.push((0, import_objectSpread28.default)({
    input,
    result: opts.result,
    elapsedMs: opts.elapsedMs
  }, withContext && { context: opts.context }));
  return {
    parts,
    args
  };
}
var defaultLogger = ({ c = console, colorMode = "css", withContext }) => (props) => {
  const rawInput = props.input;
  const input = isFormData2(rawInput) ? Object.fromEntries(rawInput) : rawInput;
  const { parts, args } = constructPartsAndArgs((0, import_objectSpread28.default)((0, import_objectSpread28.default)({}, props), {}, {
    colorMode,
    input,
    withContext
  }));
  const fn = props.direction === "down" && props.result && (props.result instanceof Error || "error" in props.result.result && props.result.result.error) ? "error" : "log";
  c[fn].apply(null, [parts.join(" ")].concat(args));
};
function loggerLink(opts = {}) {
  var _opts$colorMode, _opts$withContext;
  const { enabled = () => true } = opts;
  const colorMode = (_opts$colorMode = opts.colorMode) !== null && _opts$colorMode !== void 0 ? _opts$colorMode : typeof window === "undefined" ? "ansi" : "css";
  const withContext = (_opts$withContext = opts.withContext) !== null && _opts$withContext !== void 0 ? _opts$withContext : colorMode === "css";
  const { logger = defaultLogger({
    c: opts.console,
    colorMode,
    withContext
  }) } = opts;
  return () => {
    return ({ op, next }) => {
      return observable((observer) => {
        if (enabled((0, import_objectSpread28.default)((0, import_objectSpread28.default)({}, op), {}, { direction: "up" }))) logger((0, import_objectSpread28.default)((0, import_objectSpread28.default)({}, op), {}, { direction: "up" }));
        const requestStartTime = Date.now();
        function logResult(result) {
          const elapsedMs = Date.now() - requestStartTime;
          if (enabled((0, import_objectSpread28.default)((0, import_objectSpread28.default)({}, op), {}, {
            direction: "down",
            result
          }))) logger((0, import_objectSpread28.default)((0, import_objectSpread28.default)({}, op), {}, {
            direction: "down",
            elapsedMs,
            result
          }));
        }
        return next(op).pipe(tap({
          next(result) {
            logResult(result);
          },
          error(result) {
            logResult(result);
          }
        })).subscribe(observer);
      });
    };
  };
}

// ../node_modules/@trpc/client/dist/wsLink-H5IjZfJW.mjs
var resultOf = (value, ...args) => {
  return typeof value === "function" ? value(...args) : value;
};
var import_defineProperty$3 = __toESM4(require_defineProperty3(), 1);
function withResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject
  };
}
async function prepareUrl(urlOptions) {
  const url = await resultOf(urlOptions.url);
  if (!urlOptions.connectionParams) return url;
  const prefix = url.includes("?") ? "&" : "?";
  const connectionParams = `${prefix}connectionParams=1`;
  return url + connectionParams;
}
async function buildConnectionMessage(connectionParams) {
  const message = {
    method: "connectionParams",
    data: await resultOf(connectionParams)
  };
  return JSON.stringify(message);
}
var import_defineProperty$2 = __toESM4(require_defineProperty3(), 1);
var import_defineProperty$1 = __toESM4(require_defineProperty3(), 1);
function asyncWsOpen(ws) {
  const { promise, resolve, reject } = withResolvers();
  ws.addEventListener("open", () => {
    ws.removeEventListener("error", reject);
    resolve();
  });
  ws.addEventListener("error", reject);
  return promise;
}
function setupPingInterval(ws, { intervalMs, pongTimeoutMs }) {
  let pingTimeout;
  let pongTimeout;
  function start() {
    pingTimeout = setTimeout(() => {
      ws.send("PING");
      pongTimeout = setTimeout(() => {
        ws.close();
      }, pongTimeoutMs);
    }, intervalMs);
  }
  function reset() {
    clearTimeout(pingTimeout);
    start();
  }
  function pong() {
    clearTimeout(pongTimeout);
    reset();
  }
  ws.addEventListener("open", start);
  ws.addEventListener("message", ({ data }) => {
    clearTimeout(pingTimeout);
    start();
    if (data === "PONG") pong();
  });
  ws.addEventListener("close", () => {
    clearTimeout(pingTimeout);
    clearTimeout(pongTimeout);
  });
}
var WsConnection = class WsConnection2 {
  constructor(opts) {
    var _opts$WebSocketPonyfi;
    (0, import_defineProperty$1.default)(this, "id", ++WsConnection2.connectCount);
    (0, import_defineProperty$1.default)(this, "WebSocketPonyfill", void 0);
    (0, import_defineProperty$1.default)(this, "urlOptions", void 0);
    (0, import_defineProperty$1.default)(this, "keepAliveOpts", void 0);
    (0, import_defineProperty$1.default)(this, "wsObservable", behaviorSubject(null));
    (0, import_defineProperty$1.default)(this, "openPromise", null);
    this.WebSocketPonyfill = (_opts$WebSocketPonyfi = opts.WebSocketPonyfill) !== null && _opts$WebSocketPonyfi !== void 0 ? _opts$WebSocketPonyfi : WebSocket;
    if (!this.WebSocketPonyfill) throw new Error("No WebSocket implementation found - you probably don't want to use this on the server, but if you do you need to pass a `WebSocket`-ponyfill");
    this.urlOptions = opts.urlOptions;
    this.keepAliveOpts = opts.keepAlive;
  }
  get ws() {
    return this.wsObservable.get();
  }
  set ws(ws) {
    this.wsObservable.next(ws);
  }
  /**
  * Checks if the WebSocket connection is open and ready to communicate.
  */
  isOpen() {
    return !!this.ws && this.ws.readyState === this.WebSocketPonyfill.OPEN && !this.openPromise;
  }
  /**
  * Checks if the WebSocket connection is closed or in the process of closing.
  */
  isClosed() {
    return !!this.ws && (this.ws.readyState === this.WebSocketPonyfill.CLOSING || this.ws.readyState === this.WebSocketPonyfill.CLOSED);
  }
  async open() {
    var _this = this;
    if (_this.openPromise) return _this.openPromise;
    _this.id = ++WsConnection2.connectCount;
    const wsPromise = prepareUrl(_this.urlOptions).then((url) => new _this.WebSocketPonyfill(url));
    _this.openPromise = wsPromise.then(async (ws) => {
      _this.ws = ws;
      ws.addEventListener("message", function({ data }) {
        if (data === "PING") this.send("PONG");
      });
      if (_this.keepAliveOpts.enabled) setupPingInterval(ws, _this.keepAliveOpts);
      ws.addEventListener("close", () => {
        if (_this.ws === ws) _this.ws = null;
      });
      await asyncWsOpen(ws);
      if (_this.urlOptions.connectionParams) ws.send(await buildConnectionMessage(_this.urlOptions.connectionParams));
    });
    try {
      await _this.openPromise;
    } finally {
      _this.openPromise = null;
    }
  }
  /**
  * Closes the WebSocket connection gracefully.
  * Waits for any ongoing open operation to complete before closing.
  */
  async close() {
    var _this2 = this;
    try {
      await _this2.openPromise;
    } finally {
      var _this$ws;
      (_this$ws = _this2.ws) === null || _this$ws === void 0 || _this$ws.close();
    }
  }
};
(0, import_defineProperty$1.default)(WsConnection, "connectCount", 0);
var import_defineProperty3 = __toESM4(require_defineProperty3(), 1);
var import_objectSpread29 = __toESM4(require_objectSpread23(), 1);

// ../node_modules/@trpc/client/dist/index.mjs
var import_defineProperty4 = __toESM4(require_defineProperty3(), 1);
var import_objectSpread2$4 = __toESM4(require_objectSpread23(), 1);
var TRPCUntypedClient = class {
  constructor(opts) {
    (0, import_defineProperty4.default)(this, "links", void 0);
    (0, import_defineProperty4.default)(this, "runtime", void 0);
    (0, import_defineProperty4.default)(this, "requestId", void 0);
    this.requestId = 0;
    this.runtime = {};
    this.links = opts.links.map((link) => link(this.runtime));
  }
  $request(opts) {
    var _opts$context;
    const chain$ = createChain({
      links: this.links,
      op: (0, import_objectSpread2$4.default)((0, import_objectSpread2$4.default)({}, opts), {}, {
        context: (_opts$context = opts.context) !== null && _opts$context !== void 0 ? _opts$context : {},
        id: ++this.requestId
      })
    });
    return chain$.pipe(share());
  }
  async requestAsPromise(opts) {
    var _this = this;
    try {
      const req$ = _this.$request(opts);
      const envelope = await observableToPromise(req$);
      const data = envelope.result.data;
      return data;
    } catch (err) {
      throw TRPCClientError.from(err);
    }
  }
  query(path, input, opts) {
    return this.requestAsPromise({
      type: "query",
      path,
      input,
      context: opts === null || opts === void 0 ? void 0 : opts.context,
      signal: opts === null || opts === void 0 ? void 0 : opts.signal
    });
  }
  mutation(path, input, opts) {
    return this.requestAsPromise({
      type: "mutation",
      path,
      input,
      context: opts === null || opts === void 0 ? void 0 : opts.context,
      signal: opts === null || opts === void 0 ? void 0 : opts.signal
    });
  }
  subscription(path, input, opts) {
    const observable$ = this.$request({
      type: "subscription",
      path,
      input,
      context: opts.context,
      signal: opts.signal
    });
    return observable$.subscribe({
      next(envelope) {
        switch (envelope.result.type) {
          case "state": {
            var _opts$onConnectionSta;
            (_opts$onConnectionSta = opts.onConnectionStateChange) === null || _opts$onConnectionSta === void 0 || _opts$onConnectionSta.call(opts, envelope.result);
            break;
          }
          case "started": {
            var _opts$onStarted;
            (_opts$onStarted = opts.onStarted) === null || _opts$onStarted === void 0 || _opts$onStarted.call(opts, { context: envelope.context });
            break;
          }
          case "stopped": {
            var _opts$onStopped;
            (_opts$onStopped = opts.onStopped) === null || _opts$onStopped === void 0 || _opts$onStopped.call(opts);
            break;
          }
          case "data":
          case void 0: {
            var _opts$onData;
            (_opts$onData = opts.onData) === null || _opts$onData === void 0 || _opts$onData.call(opts, envelope.result.data);
            break;
          }
        }
      },
      error(err) {
        var _opts$onError;
        (_opts$onError = opts.onError) === null || _opts$onError === void 0 || _opts$onError.call(opts, err);
      },
      complete() {
        var _opts$onComplete;
        (_opts$onComplete = opts.onComplete) === null || _opts$onComplete === void 0 || _opts$onComplete.call(opts);
      }
    });
  }
};
var untypedClientSymbol = Symbol.for("trpc_untypedClient");
var clientCallTypeMap = {
  query: "query",
  mutate: "mutation",
  subscribe: "subscription"
};
var clientCallTypeToProcedureType = (clientCallType) => {
  return clientCallTypeMap[clientCallType];
};
function createTRPCClientProxy(client) {
  const proxy = createRecursiveProxy(({ path, args }) => {
    const pathCopy = [...path];
    const procedureType = clientCallTypeToProcedureType(pathCopy.pop());
    const fullPath = pathCopy.join(".");
    return client[procedureType](fullPath, ...args);
  });
  return createFlatProxy((key) => {
    if (key === untypedClientSymbol) return client;
    return proxy[key];
  });
}
function createTRPCClient(opts) {
  const client = new TRPCUntypedClient(opts);
  const proxy = createTRPCClientProxy(client);
  return proxy;
}
function getUntypedClient(client) {
  return client[untypedClientSymbol];
}
var import_objectSpread2$3 = __toESM4(require_objectSpread23(), 1);
var import_objectSpread2$2 = __toESM4(require_objectSpread23(), 1);
var require_asyncIterator = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/asyncIterator.js"(exports, module) {
  function _asyncIterator$1(r) {
    var n, t, o, e = 2;
    for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--; ) {
      if (t && null != (n = r[t])) return n.call(r);
      if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r));
      t = "@@asyncIterator", o = "@@iterator";
    }
    throw new TypeError("Object is not async iterable");
  }
  function AsyncFromSyncIterator(r) {
    function AsyncFromSyncIteratorContinuation(r$1) {
      if (Object(r$1) !== r$1) return Promise.reject(new TypeError(r$1 + " is not an object."));
      var n = r$1.done;
      return Promise.resolve(r$1.value).then(function(r$2) {
        return {
          value: r$2,
          done: n
        };
      });
    }
    return AsyncFromSyncIterator = function AsyncFromSyncIterator$1(r$1) {
      this.s = r$1, this.n = r$1.next;
    }, AsyncFromSyncIterator.prototype = {
      s: null,
      n: null,
      next: function next() {
        return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
      },
      "return": function _return(r$1) {
        var n = this.s["return"];
        return void 0 === n ? Promise.resolve({
          value: r$1,
          done: true
        }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments));
      },
      "throw": function _throw(r$1) {
        var n = this.s["return"];
        return void 0 === n ? Promise.reject(r$1) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments));
      }
    }, new AsyncFromSyncIterator(r);
  }
  module.exports = _asyncIterator$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var import_asyncIterator = __toESM4(require_asyncIterator(), 1);
var import_objectSpread2$12 = __toESM4(require_objectSpread23(), 1);
var require_usingCtx = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/usingCtx.js"(exports, module) {
  function _usingCtx() {
    var r = "function" == typeof SuppressedError ? SuppressedError : function(r$1, e$1) {
      var n$1 = Error();
      return n$1.name = "SuppressedError", n$1.error = r$1, n$1.suppressed = e$1, n$1;
    }, e = {}, n = [];
    function using(r$1, e$1) {
      if (null != e$1) {
        if (Object(e$1) !== e$1) throw new TypeError("using declarations can only be used with objects, functions, null, or undefined.");
        if (r$1) var o = e$1[Symbol.asyncDispose || Symbol["for"]("Symbol.asyncDispose")];
        if (void 0 === o && (o = e$1[Symbol.dispose || Symbol["for"]("Symbol.dispose")], r$1)) var t = o;
        if ("function" != typeof o) throw new TypeError("Object is not disposable.");
        t && (o = function o$1() {
          try {
            t.call(e$1);
          } catch (r$2) {
            return Promise.reject(r$2);
          }
        }), n.push({
          v: e$1,
          d: o,
          a: r$1
        });
      } else r$1 && n.push({
        d: e$1,
        a: r$1
      });
      return e$1;
    }
    return {
      e,
      u: using.bind(null, false),
      a: using.bind(null, true),
      d: function d() {
        var o, t = this.e, s = 0;
        function next() {
          for (; o = n.pop(); ) try {
            if (!o.a && 1 === s) return s = 0, n.push(o), Promise.resolve().then(next);
            if (o.d) {
              var r$1 = o.d.call(o.v);
              if (o.a) return s |= 2, Promise.resolve(r$1).then(next, err);
            } else s |= 1;
          } catch (r$2) {
            return err(r$2);
          }
          if (1 === s) return t !== e ? Promise.reject(t) : Promise.resolve();
          if (t !== e) throw t;
        }
        function err(n$1) {
          return t = t !== e ? new r(n$1, t) : n$1, next();
        }
        return next();
      }
    };
  }
  module.exports = _usingCtx, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_OverloadYield = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/OverloadYield.js"(exports, module) {
  function _OverloadYield(e, d) {
    this.v = e, this.k = d;
  }
  module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_awaitAsyncGenerator = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/awaitAsyncGenerator.js"(exports, module) {
  var OverloadYield$1 = require_OverloadYield();
  function _awaitAsyncGenerator$1(e) {
    return new OverloadYield$1(e, 0);
  }
  module.exports = _awaitAsyncGenerator$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_wrapAsyncGenerator = __commonJS3({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/wrapAsyncGenerator.js"(exports, module) {
  var OverloadYield = require_OverloadYield();
  function _wrapAsyncGenerator$1(e) {
    return function() {
      return new AsyncGenerator(e.apply(this, arguments));
    };
  }
  function AsyncGenerator(e) {
    var r, t;
    function resume(r$1, t$1) {
      try {
        var n = e[r$1](t$1), o = n.value, u = o instanceof OverloadYield;
        Promise.resolve(u ? o.v : o).then(function(t$2) {
          if (u) {
            var i = "return" === r$1 ? "return" : "next";
            if (!o.k || t$2.done) return resume(i, t$2);
            t$2 = e[i](t$2).value;
          }
          settle(n.done ? "return" : "normal", t$2);
        }, function(e$1) {
          resume("throw", e$1);
        });
      } catch (e$1) {
        settle("throw", e$1);
      }
    }
    function settle(e$1, n) {
      switch (e$1) {
        case "return":
          r.resolve({
            value: n,
            done: true
          });
          break;
        case "throw":
          r.reject(n);
          break;
        default:
          r.resolve({
            value: n,
            done: false
          });
      }
      (r = r.next) ? resume(r.key, r.arg) : t = null;
    }
    this._invoke = function(e$1, n) {
      return new Promise(function(o, u) {
        var i = {
          key: e$1,
          arg: n,
          resolve: o,
          reject: u,
          next: null
        };
        t ? t = t.next = i : (r = t = i, resume(e$1, n));
      });
    }, "function" != typeof e["return"] && (this["return"] = void 0);
  }
  AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
    return this;
  }, AsyncGenerator.prototype.next = function(e) {
    return this._invoke("next", e);
  }, AsyncGenerator.prototype["throw"] = function(e) {
    return this._invoke("throw", e);
  }, AsyncGenerator.prototype["return"] = function(e) {
    return this._invoke("return", e);
  };
  module.exports = _wrapAsyncGenerator$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var import_usingCtx = __toESM4(require_usingCtx(), 1);
var import_awaitAsyncGenerator = __toESM4(require_awaitAsyncGenerator(), 1);
var import_wrapAsyncGenerator = __toESM4(require_wrapAsyncGenerator(), 1);
var import_objectSpread210 = __toESM4(require_objectSpread23(), 1);

// ../node_modules/@trpc/react-query/dist/shared-JtnEvJvB.mjs
var React$2 = __toESM(require_react(), 1);
var React$1 = __toESM(require_react(), 1);
var React8 = __toESM(require_react(), 1);
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function createReactDecoration(hooks) {
  return createRecursiveProxy(({ path, args }) => {
    var _rest$;
    const pathCopy = [...path];
    const lastArg = pathCopy.pop();
    if (lastArg === "useMutation") return hooks[lastArg](pathCopy, ...args);
    if (lastArg === "_def") return { path: pathCopy };
    const [input, ...rest] = args;
    const opts = (_rest$ = rest[0]) !== null && _rest$ !== void 0 ? _rest$ : {};
    return hooks[lastArg](pathCopy, input, opts);
  });
}
var _React$createContext;
var contextProps = [
  "client",
  "ssrContext",
  "ssrState",
  "abortOnUnmount"
];
var TRPCContext = (_React$createContext = React$2.createContext) === null || _React$createContext === void 0 ? void 0 : _React$createContext.call(React$2, null);
var getQueryType = (utilName) => {
  switch (utilName) {
    case "queryOptions":
    case "fetch":
    case "ensureData":
    case "prefetch":
    case "getData":
    case "setData":
    case "setQueriesData":
      return "query";
    case "infiniteQueryOptions":
    case "fetchInfinite":
    case "prefetchInfinite":
    case "getInfiniteData":
    case "setInfiniteData":
      return "infinite";
    case "setMutationDefaults":
    case "getMutationDefaults":
    case "isMutating":
    case "cancel":
    case "invalidate":
    case "refetch":
    case "reset":
      return "any";
  }
};
function createRecursiveUtilsProxy(context) {
  return createRecursiveProxy((opts) => {
    const path = [...opts.path];
    const utilName = path.pop();
    const args = [...opts.args];
    const input = args.shift();
    const queryType = getQueryType(utilName);
    const queryKey = getQueryKeyInternal(path, input, queryType);
    const contextMap = {
      infiniteQueryOptions: () => context.infiniteQueryOptions(path, queryKey, args[0]),
      queryOptions: () => context.queryOptions(path, queryKey, ...args),
      fetch: () => context.fetchQuery(queryKey, ...args),
      fetchInfinite: () => context.fetchInfiniteQuery(queryKey, args[0]),
      prefetch: () => context.prefetchQuery(queryKey, ...args),
      prefetchInfinite: () => context.prefetchInfiniteQuery(queryKey, args[0]),
      ensureData: () => context.ensureQueryData(queryKey, ...args),
      invalidate: () => context.invalidateQueries(queryKey, ...args),
      reset: () => context.resetQueries(queryKey, ...args),
      refetch: () => context.refetchQueries(queryKey, ...args),
      cancel: () => context.cancelQuery(queryKey, ...args),
      setData: () => {
        context.setQueryData(queryKey, args[0], args[1]);
      },
      setQueriesData: () => context.setQueriesData(queryKey, args[0], args[1], args[2]),
      setInfiniteData: () => {
        context.setInfiniteQueryData(queryKey, args[0], args[1]);
      },
      getData: () => context.getQueryData(queryKey),
      getInfiniteData: () => context.getInfiniteQueryData(queryKey),
      setMutationDefaults: () => context.setMutationDefaults(getMutationKeyInternal(path), input),
      getMutationDefaults: () => context.getMutationDefaults(getMutationKeyInternal(path)),
      isMutating: () => context.isMutating({ mutationKey: getMutationKeyInternal(path) })
    };
    return contextMap[utilName]();
  });
}
function createReactQueryUtils(context) {
  const clientProxy = createTRPCClientProxy(context.client);
  const proxy = createRecursiveUtilsProxy(context);
  return createFlatProxy((key) => {
    const contextName = key;
    if (contextName === "client") return clientProxy;
    if (contextProps.includes(contextName)) return context[contextName];
    return proxy[key];
  });
}
var import_objectSpread2$32 = __toESM3(require_objectSpread22(), 1);
function createUseQueries(client) {
  const untypedClient = client instanceof TRPCUntypedClient ? client : getUntypedClient(client);
  return createRecursiveProxy((opts) => {
    const arrayPath = opts.path;
    const dotPath = arrayPath.join(".");
    const [input, _opts] = opts.args;
    const options = (0, import_objectSpread2$32.default)({
      queryKey: getQueryKeyInternal(arrayPath, input, "query"),
      queryFn: () => {
        return untypedClient.query(dotPath, input, _opts === null || _opts === void 0 ? void 0 : _opts.trpc);
      }
    }, _opts);
    return options;
  });
}
var import_objectSpread2$22 = __toESM3(require_objectSpread22(), 1);
function getClientArgs(queryKey, opts, infiniteParams) {
  var _queryKey$;
  const path = queryKey[0];
  let input = (_queryKey$ = queryKey[1]) === null || _queryKey$ === void 0 ? void 0 : _queryKey$.input;
  if (infiniteParams) {
    var _input;
    input = (0, import_objectSpread2$22.default)((0, import_objectSpread2$22.default)((0, import_objectSpread2$22.default)({}, (_input = input) !== null && _input !== void 0 ? _input : {}), infiniteParams.pageParam ? { cursor: infiniteParams.pageParam } : {}), {}, { direction: infiniteParams.direction });
  }
  return [
    path.join("."),
    input,
    opts === null || opts === void 0 ? void 0 : opts.trpc
  ];
}
var require_asyncIterator2 = __commonJS2({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/asyncIterator.js"(exports, module) {
  function _asyncIterator$1(r) {
    var n, t, o, e = 2;
    for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--; ) {
      if (t && null != (n = r[t])) return n.call(r);
      if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r));
      t = "@@asyncIterator", o = "@@iterator";
    }
    throw new TypeError("Object is not async iterable");
  }
  function AsyncFromSyncIterator(r) {
    function AsyncFromSyncIteratorContinuation(r$1) {
      if (Object(r$1) !== r$1) return Promise.reject(new TypeError(r$1 + " is not an object."));
      var n = r$1.done;
      return Promise.resolve(r$1.value).then(function(r$2) {
        return {
          value: r$2,
          done: n
        };
      });
    }
    return AsyncFromSyncIterator = function AsyncFromSyncIterator$1(r$1) {
      this.s = r$1, this.n = r$1.next;
    }, AsyncFromSyncIterator.prototype = {
      s: null,
      n: null,
      next: function next() {
        return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
      },
      "return": function _return(r$1) {
        var n = this.s["return"];
        return void 0 === n ? Promise.resolve({
          value: r$1,
          done: true
        }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments));
      },
      "throw": function _throw(r$1) {
        var n = this.s["return"];
        return void 0 === n ? Promise.reject(r$1) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments));
      }
    }, new AsyncFromSyncIterator(r);
  }
  module.exports = _asyncIterator$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var import_asyncIterator2 = __toESM3(require_asyncIterator2(), 1);
function createTRPCOptionsResult(value) {
  const path = value.path.join(".");
  return { path };
}
function useHookResult(value) {
  const result = createTRPCOptionsResult(value);
  return React$1.useMemo(() => result, [result]);
}
async function buildQueryFromAsyncIterable(asyncIterable, queryClient, queryKey) {
  const queryCache = queryClient.getQueryCache();
  const query = queryCache.build(queryClient, { queryKey });
  query.setState({
    data: [],
    status: "success"
  });
  const aggregate = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (var _iterator = (0, import_asyncIterator2.default)(asyncIterable), _step; _iteratorAbruptCompletion = !(_step = await _iterator.next()).done; _iteratorAbruptCompletion = false) {
      const value = _step.value;
      {
        aggregate.push(value);
        query.setState({ data: [...aggregate] });
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) await _iterator.return();
    } finally {
      if (_didIteratorError) throw _iteratorError;
    }
  }
  return aggregate;
}
var import_objectSpread2$13 = __toESM3(require_objectSpread22(), 1);
function createUtilityFunctions(opts) {
  const { client, queryClient } = opts;
  const untypedClient = client instanceof TRPCUntypedClient ? client : getUntypedClient(client);
  return {
    infiniteQueryOptions: (path, queryKey, opts$1) => {
      var _queryKey$, _ref;
      const inputIsSkipToken = ((_queryKey$ = queryKey[1]) === null || _queryKey$ === void 0 ? void 0 : _queryKey$.input) === skipToken;
      const queryFn = async (queryFnContext) => {
        var _opts$trpc;
        const actualOpts = (0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, { trpc: (0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1 === null || opts$1 === void 0 ? void 0 : opts$1.trpc), (opts$1 === null || opts$1 === void 0 || (_opts$trpc = opts$1.trpc) === null || _opts$trpc === void 0 ? void 0 : _opts$trpc.abortOnUnmount) ? { signal: queryFnContext.signal } : { signal: null }) });
        const result = await untypedClient.query(...getClientArgs(queryKey, actualOpts, {
          direction: queryFnContext.direction,
          pageParam: queryFnContext.pageParam
        }));
        return result;
      };
      return Object.assign(infiniteQueryOptions((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, {
        initialData: opts$1 === null || opts$1 === void 0 ? void 0 : opts$1.initialData,
        queryKey,
        queryFn: inputIsSkipToken ? skipToken : queryFn,
        initialPageParam: (_ref = opts$1 === null || opts$1 === void 0 ? void 0 : opts$1.initialCursor) !== null && _ref !== void 0 ? _ref : null
      })), { trpc: createTRPCOptionsResult({ path }) });
    },
    queryOptions: (path, queryKey, opts$1) => {
      var _queryKey$2;
      const inputIsSkipToken = ((_queryKey$2 = queryKey[1]) === null || _queryKey$2 === void 0 ? void 0 : _queryKey$2.input) === skipToken;
      const queryFn = async (queryFnContext) => {
        var _opts$trpc2;
        const actualOpts = (0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, { trpc: (0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1 === null || opts$1 === void 0 ? void 0 : opts$1.trpc), (opts$1 === null || opts$1 === void 0 || (_opts$trpc2 = opts$1.trpc) === null || _opts$trpc2 === void 0 ? void 0 : _opts$trpc2.abortOnUnmount) ? { signal: queryFnContext.signal } : { signal: null }) });
        const result = await untypedClient.query(...getClientArgs(queryKey, actualOpts));
        if (isAsyncIterable(result)) return buildQueryFromAsyncIterable(result, queryClient, queryKey);
        return result;
      };
      return Object.assign(queryOptions((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, {
        initialData: opts$1 === null || opts$1 === void 0 ? void 0 : opts$1.initialData,
        queryKey,
        queryFn: inputIsSkipToken ? skipToken : queryFn
      })), { trpc: createTRPCOptionsResult({ path }) });
    },
    fetchQuery: (queryKey, opts$1) => {
      return queryClient.fetchQuery((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, {
        queryKey,
        queryFn: () => untypedClient.query(...getClientArgs(queryKey, opts$1))
      }));
    },
    fetchInfiniteQuery: (queryKey, opts$1) => {
      var _opts$initialCursor;
      return queryClient.fetchInfiniteQuery((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, {
        queryKey,
        queryFn: ({ pageParam, direction }) => {
          return untypedClient.query(...getClientArgs(queryKey, opts$1, {
            pageParam,
            direction
          }));
        },
        initialPageParam: (_opts$initialCursor = opts$1 === null || opts$1 === void 0 ? void 0 : opts$1.initialCursor) !== null && _opts$initialCursor !== void 0 ? _opts$initialCursor : null
      }));
    },
    prefetchQuery: (queryKey, opts$1) => {
      return queryClient.prefetchQuery((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, {
        queryKey,
        queryFn: () => untypedClient.query(...getClientArgs(queryKey, opts$1))
      }));
    },
    prefetchInfiniteQuery: (queryKey, opts$1) => {
      var _opts$initialCursor2;
      return queryClient.prefetchInfiniteQuery((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, {
        queryKey,
        queryFn: ({ pageParam, direction }) => {
          return untypedClient.query(...getClientArgs(queryKey, opts$1, {
            pageParam,
            direction
          }));
        },
        initialPageParam: (_opts$initialCursor2 = opts$1 === null || opts$1 === void 0 ? void 0 : opts$1.initialCursor) !== null && _opts$initialCursor2 !== void 0 ? _opts$initialCursor2 : null
      }));
    },
    ensureQueryData: (queryKey, opts$1) => {
      return queryClient.ensureQueryData((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts$1), {}, {
        queryKey,
        queryFn: () => untypedClient.query(...getClientArgs(queryKey, opts$1))
      }));
    },
    invalidateQueries: (queryKey, filters, options) => {
      return queryClient.invalidateQueries((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, filters), {}, { queryKey }), options);
    },
    resetQueries: (queryKey, filters, options) => {
      return queryClient.resetQueries((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, filters), {}, { queryKey }), options);
    },
    refetchQueries: (queryKey, filters, options) => {
      return queryClient.refetchQueries((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, filters), {}, { queryKey }), options);
    },
    cancelQuery: (queryKey, options) => {
      return queryClient.cancelQueries({ queryKey }, options);
    },
    setQueryData: (queryKey, updater, options) => {
      return queryClient.setQueryData(queryKey, updater, options);
    },
    setQueriesData: (queryKey, filters, updater, options) => {
      return queryClient.setQueriesData((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, filters), {}, { queryKey }), updater, options);
    },
    getQueryData: (queryKey) => {
      return queryClient.getQueryData(queryKey);
    },
    setInfiniteQueryData: (queryKey, updater, options) => {
      return queryClient.setQueryData(queryKey, updater, options);
    },
    getInfiniteQueryData: (queryKey) => {
      return queryClient.getQueryData(queryKey);
    },
    setMutationDefaults: (mutationKey, options) => {
      const path = mutationKey[0];
      const canonicalMutationFn = (input) => {
        return untypedClient.mutation(...getClientArgs([path, { input }], opts));
      };
      return queryClient.setMutationDefaults(mutationKey, typeof options === "function" ? options({ canonicalMutationFn }) : options);
    },
    getMutationDefaults: (mutationKey) => {
      return queryClient.getMutationDefaults(mutationKey);
    },
    isMutating: (filters) => {
      return queryClient.isMutating((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, filters), {}, { exact: true }));
    }
  };
}
var import_objectSpread211 = __toESM3(require_objectSpread22());
var trackResult = (result, onTrackResult) => {
  const trackedResult = new Proxy(result, { get(target, prop) {
    onTrackResult(prop);
    return target[prop];
  } });
  return trackedResult;
};
function createRootHooks(config) {
  var _config$overrides$use, _config$overrides, _config$context;
  const mutationSuccessOverride = (_config$overrides$use = config === null || config === void 0 || (_config$overrides = config.overrides) === null || _config$overrides === void 0 || (_config$overrides = _config$overrides.useMutation) === null || _config$overrides === void 0 ? void 0 : _config$overrides.onSuccess) !== null && _config$overrides$use !== void 0 ? _config$overrides$use : (options) => options.originalFn();
  const Context = (_config$context = config === null || config === void 0 ? void 0 : config.context) !== null && _config$context !== void 0 ? _config$context : TRPCContext;
  const createClient = createTRPCClient;
  const TRPCProvider = (props) => {
    var _props$ssrState;
    const { abortOnUnmount = false, queryClient, ssrContext } = props;
    const [ssrState, setSSRState] = React8.useState((_props$ssrState = props.ssrState) !== null && _props$ssrState !== void 0 ? _props$ssrState : false);
    const client = props.client instanceof TRPCUntypedClient ? props.client : getUntypedClient(props.client);
    const fns = React8.useMemo(() => createUtilityFunctions({
      client,
      queryClient
    }), [client, queryClient]);
    const contextValue = React8.useMemo(() => (0, import_objectSpread211.default)({
      abortOnUnmount,
      queryClient,
      client,
      ssrContext: ssrContext !== null && ssrContext !== void 0 ? ssrContext : null,
      ssrState
    }, fns), [
      abortOnUnmount,
      client,
      fns,
      queryClient,
      ssrContext,
      ssrState
    ]);
    React8.useEffect(() => {
      setSSRState((state) => state ? "mounted" : false);
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Context.Provider, {
      value: contextValue,
      children: props.children
    });
  };
  function useContext5() {
    const context = React8.useContext(Context);
    if (!context) throw new Error("Unable to find tRPC Context. Did you forget to wrap your App inside `withTRPC` HoC?");
    return context;
  }
  function useSSRQueryOptionsIfNeeded(queryKey, opts) {
    var _queryClient$getQuery;
    const { queryClient, ssrState } = useContext5();
    return ssrState && ssrState !== "mounted" && ((_queryClient$getQuery = queryClient.getQueryCache().find({ queryKey })) === null || _queryClient$getQuery === void 0 ? void 0 : _queryClient$getQuery.state.status) === "error" ? (0, import_objectSpread211.default)({ retryOnMount: false }, opts) : opts;
  }
  function useQuery$1(path, input, opts) {
    var _opts$trpc, _opts$enabled, _ref, _opts$trpc$abortOnUnm, _opts$trpc2;
    const context = useContext5();
    const { abortOnUnmount, client, ssrState, queryClient, prefetchQuery } = context;
    const queryKey = getQueryKeyInternal(path, input, "query");
    const defaultOpts = queryClient.getQueryDefaults(queryKey);
    const isInputSkipToken = input === skipToken;
    if (typeof window === "undefined" && ssrState === "prepass" && (opts === null || opts === void 0 || (_opts$trpc = opts.trpc) === null || _opts$trpc === void 0 ? void 0 : _opts$trpc.ssr) !== false && ((_opts$enabled = opts === null || opts === void 0 ? void 0 : opts.enabled) !== null && _opts$enabled !== void 0 ? _opts$enabled : defaultOpts === null || defaultOpts === void 0 ? void 0 : defaultOpts.enabled) !== false && !isInputSkipToken && !queryClient.getQueryCache().find({ queryKey })) prefetchQuery(queryKey, opts);
    const ssrOpts = useSSRQueryOptionsIfNeeded(queryKey, (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, defaultOpts), opts));
    const shouldAbortOnUnmount = (_ref = (_opts$trpc$abortOnUnm = opts === null || opts === void 0 || (_opts$trpc2 = opts.trpc) === null || _opts$trpc2 === void 0 ? void 0 : _opts$trpc2.abortOnUnmount) !== null && _opts$trpc$abortOnUnm !== void 0 ? _opts$trpc$abortOnUnm : config === null || config === void 0 ? void 0 : config.abortOnUnmount) !== null && _ref !== void 0 ? _ref : abortOnUnmount;
    const hook = useQuery((0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts), {}, {
      queryKey,
      queryFn: isInputSkipToken ? input : async (queryFunctionContext) => {
        const actualOpts = (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts), {}, { trpc: (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts === null || ssrOpts === void 0 ? void 0 : ssrOpts.trpc), shouldAbortOnUnmount ? { signal: queryFunctionContext.signal } : { signal: null }) });
        const result = await client.query(...getClientArgs(queryKey, actualOpts));
        if (isAsyncIterable(result)) return buildQueryFromAsyncIterable(result, queryClient, queryKey);
        return result;
      }
    }), queryClient);
    hook.trpc = useHookResult({ path });
    return hook;
  }
  function usePrefetchQuery$1(path, input, opts) {
    var _ref2, _opts$trpc$abortOnUnm2, _opts$trpc3;
    const context = useContext5();
    const queryKey = getQueryKeyInternal(path, input, "query");
    const isInputSkipToken = input === skipToken;
    const shouldAbortOnUnmount = (_ref2 = (_opts$trpc$abortOnUnm2 = opts === null || opts === void 0 || (_opts$trpc3 = opts.trpc) === null || _opts$trpc3 === void 0 ? void 0 : _opts$trpc3.abortOnUnmount) !== null && _opts$trpc$abortOnUnm2 !== void 0 ? _opts$trpc$abortOnUnm2 : config === null || config === void 0 ? void 0 : config.abortOnUnmount) !== null && _ref2 !== void 0 ? _ref2 : context.abortOnUnmount;
    usePrefetchQuery((0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, opts), {}, {
      queryKey,
      queryFn: isInputSkipToken ? input : (queryFunctionContext) => {
        const actualOpts = { trpc: (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, opts === null || opts === void 0 ? void 0 : opts.trpc), shouldAbortOnUnmount ? { signal: queryFunctionContext.signal } : {}) };
        return context.client.query(...getClientArgs(queryKey, actualOpts));
      }
    }));
  }
  function useSuspenseQuery$1(path, input, opts) {
    var _ref3, _opts$trpc$abortOnUnm3, _opts$trpc4;
    const context = useContext5();
    const queryKey = getQueryKeyInternal(path, input, "query");
    const shouldAbortOnUnmount = (_ref3 = (_opts$trpc$abortOnUnm3 = opts === null || opts === void 0 || (_opts$trpc4 = opts.trpc) === null || _opts$trpc4 === void 0 ? void 0 : _opts$trpc4.abortOnUnmount) !== null && _opts$trpc$abortOnUnm3 !== void 0 ? _opts$trpc$abortOnUnm3 : config === null || config === void 0 ? void 0 : config.abortOnUnmount) !== null && _ref3 !== void 0 ? _ref3 : context.abortOnUnmount;
    const hook = useSuspenseQuery((0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, opts), {}, {
      queryKey,
      queryFn: (queryFunctionContext) => {
        const actualOpts = (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, opts), {}, { trpc: (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, opts === null || opts === void 0 ? void 0 : opts.trpc), shouldAbortOnUnmount ? { signal: queryFunctionContext.signal } : { signal: null }) });
        return context.client.query(...getClientArgs(queryKey, actualOpts));
      }
    }), context.queryClient);
    hook.trpc = useHookResult({ path });
    return [hook.data, hook];
  }
  function useMutation$1(path, opts) {
    const { client, queryClient } = useContext5();
    const mutationKey = getMutationKeyInternal(path);
    const defaultOpts = queryClient.defaultMutationOptions(queryClient.getMutationDefaults(mutationKey));
    const hook = useMutation((0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, opts), {}, {
      mutationKey,
      mutationFn: (input) => {
        return client.mutation(...getClientArgs([path, { input }], opts));
      },
      onSuccess(...args) {
        var _ref4, _opts$meta;
        const originalFn = () => {
          var _opts$onSuccess, _opts$onSuccess2, _defaultOpts$onSucces;
          return (_opts$onSuccess = opts === null || opts === void 0 || (_opts$onSuccess2 = opts.onSuccess) === null || _opts$onSuccess2 === void 0 ? void 0 : _opts$onSuccess2.call(opts, ...args)) !== null && _opts$onSuccess !== void 0 ? _opts$onSuccess : defaultOpts === null || defaultOpts === void 0 || (_defaultOpts$onSucces = defaultOpts.onSuccess) === null || _defaultOpts$onSucces === void 0 ? void 0 : _defaultOpts$onSucces.call(defaultOpts, ...args);
        };
        return mutationSuccessOverride({
          originalFn,
          queryClient,
          meta: (_ref4 = (_opts$meta = opts === null || opts === void 0 ? void 0 : opts.meta) !== null && _opts$meta !== void 0 ? _opts$meta : defaultOpts === null || defaultOpts === void 0 ? void 0 : defaultOpts.meta) !== null && _ref4 !== void 0 ? _ref4 : {}
        });
      }
    }), queryClient);
    hook.trpc = useHookResult({ path });
    return hook;
  }
  const initialStateIdle = {
    data: void 0,
    error: null,
    status: "idle"
  };
  const initialStateConnecting = {
    data: void 0,
    error: null,
    status: "connecting"
  };
  function useSubscription(path, input, opts) {
    var _opts$enabled2;
    const enabled = (_opts$enabled2 = opts === null || opts === void 0 ? void 0 : opts.enabled) !== null && _opts$enabled2 !== void 0 ? _opts$enabled2 : input !== skipToken;
    const queryKey = hashKey(getQueryKeyInternal(path, input, "any"));
    const { client } = useContext5();
    const optsRef = React8.useRef(opts);
    React8.useEffect(() => {
      optsRef.current = opts;
    });
    const [trackedProps] = React8.useState(/* @__PURE__ */ new Set([]));
    const addTrackedProp = React8.useCallback((key) => {
      trackedProps.add(key);
    }, [trackedProps]);
    const currentSubscriptionRef = React8.useRef(null);
    const updateState = React8.useCallback((callback) => {
      const prev = resultRef.current;
      const next = resultRef.current = callback(prev);
      let shouldUpdate = false;
      for (const key of trackedProps) if (prev[key] !== next[key]) {
        shouldUpdate = true;
        break;
      }
      if (shouldUpdate) setState(trackResult(next, addTrackedProp));
    }, [addTrackedProp, trackedProps]);
    const reset = React8.useCallback(() => {
      var _currentSubscriptionR;
      (_currentSubscriptionR = currentSubscriptionRef.current) === null || _currentSubscriptionR === void 0 || _currentSubscriptionR.unsubscribe();
      if (!enabled) {
        updateState(() => (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, initialStateIdle), {}, { reset }));
        return;
      }
      updateState(() => (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, initialStateConnecting), {}, { reset }));
      const subscription = client.subscription(path.join("."), input !== null && input !== void 0 ? input : void 0, {
        onStarted: () => {
          var _optsRef$current$onSt, _optsRef$current;
          (_optsRef$current$onSt = (_optsRef$current = optsRef.current).onStarted) === null || _optsRef$current$onSt === void 0 || _optsRef$current$onSt.call(_optsRef$current);
          updateState((prev) => (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, prev), {}, {
            status: "pending",
            error: null
          }));
        },
        onData: (data) => {
          var _optsRef$current$onDa, _optsRef$current2;
          (_optsRef$current$onDa = (_optsRef$current2 = optsRef.current).onData) === null || _optsRef$current$onDa === void 0 || _optsRef$current$onDa.call(_optsRef$current2, data);
          updateState((prev) => (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, prev), {}, {
            status: "pending",
            data,
            error: null
          }));
        },
        onError: (error) => {
          var _optsRef$current$onEr, _optsRef$current3;
          (_optsRef$current$onEr = (_optsRef$current3 = optsRef.current).onError) === null || _optsRef$current$onEr === void 0 || _optsRef$current$onEr.call(_optsRef$current3, error);
          updateState((prev) => (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, prev), {}, {
            status: "error",
            error
          }));
        },
        onConnectionStateChange: (result) => {
          updateState((prev) => {
            switch (result.state) {
              case "idle":
                return (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, prev), {}, {
                  status: result.state,
                  error: null,
                  data: void 0
                });
              case "connecting":
                return (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, prev), {}, {
                  error: result.error,
                  status: result.state
                });
              case "pending":
                return prev;
            }
          });
        },
        onComplete: () => {
          var _optsRef$current$onCo, _optsRef$current4;
          (_optsRef$current$onCo = (_optsRef$current4 = optsRef.current).onComplete) === null || _optsRef$current$onCo === void 0 || _optsRef$current$onCo.call(_optsRef$current4);
          updateState((prev) => (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, prev), {}, {
            status: "idle",
            error: null,
            data: void 0
          }));
        }
      });
      currentSubscriptionRef.current = subscription;
    }, [
      client,
      queryKey,
      enabled,
      updateState
    ]);
    React8.useEffect(() => {
      reset();
      return () => {
        var _currentSubscriptionR2;
        (_currentSubscriptionR2 = currentSubscriptionRef.current) === null || _currentSubscriptionR2 === void 0 || _currentSubscriptionR2.unsubscribe();
      };
    }, [reset]);
    const resultRef = React8.useRef(enabled ? (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, initialStateConnecting), {}, { reset }) : (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, initialStateIdle), {}, { reset }));
    const [state, setState] = React8.useState(trackResult(resultRef.current, addTrackedProp));
    return state;
  }
  function useInfiniteQuery$1(path, input, opts) {
    var _opts$trpc5, _opts$enabled3, _opts$trpc$abortOnUnm4, _opts$trpc6, _opts$initialCursor;
    const { client, ssrState, prefetchInfiniteQuery, queryClient, abortOnUnmount } = useContext5();
    const queryKey = getQueryKeyInternal(path, input, "infinite");
    const defaultOpts = queryClient.getQueryDefaults(queryKey);
    const isInputSkipToken = input === skipToken;
    if (typeof window === "undefined" && ssrState === "prepass" && (opts === null || opts === void 0 || (_opts$trpc5 = opts.trpc) === null || _opts$trpc5 === void 0 ? void 0 : _opts$trpc5.ssr) !== false && ((_opts$enabled3 = opts === null || opts === void 0 ? void 0 : opts.enabled) !== null && _opts$enabled3 !== void 0 ? _opts$enabled3 : defaultOpts === null || defaultOpts === void 0 ? void 0 : defaultOpts.enabled) !== false && !isInputSkipToken && !queryClient.getQueryCache().find({ queryKey })) prefetchInfiniteQuery(queryKey, (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, defaultOpts), opts));
    const ssrOpts = useSSRQueryOptionsIfNeeded(queryKey, (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, defaultOpts), opts));
    const shouldAbortOnUnmount = (_opts$trpc$abortOnUnm4 = opts === null || opts === void 0 || (_opts$trpc6 = opts.trpc) === null || _opts$trpc6 === void 0 ? void 0 : _opts$trpc6.abortOnUnmount) !== null && _opts$trpc$abortOnUnm4 !== void 0 ? _opts$trpc$abortOnUnm4 : abortOnUnmount;
    const hook = useInfiniteQuery((0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts), {}, {
      initialPageParam: (_opts$initialCursor = opts.initialCursor) !== null && _opts$initialCursor !== void 0 ? _opts$initialCursor : null,
      persister: opts.persister,
      queryKey,
      queryFn: isInputSkipToken ? input : (queryFunctionContext) => {
        var _queryFunctionContext;
        const actualOpts = (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts), {}, { trpc: (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts === null || ssrOpts === void 0 ? void 0 : ssrOpts.trpc), shouldAbortOnUnmount ? { signal: queryFunctionContext.signal } : { signal: null }) });
        return client.query(...getClientArgs(queryKey, actualOpts, {
          pageParam: (_queryFunctionContext = queryFunctionContext.pageParam) !== null && _queryFunctionContext !== void 0 ? _queryFunctionContext : opts.initialCursor,
          direction: queryFunctionContext.direction
        }));
      }
    }), queryClient);
    hook.trpc = useHookResult({ path });
    return hook;
  }
  function usePrefetchInfiniteQuery$1(path, input, opts) {
    var _opts$trpc$abortOnUnm5, _opts$trpc7, _opts$initialCursor2;
    const context = useContext5();
    const queryKey = getQueryKeyInternal(path, input, "infinite");
    const defaultOpts = context.queryClient.getQueryDefaults(queryKey);
    const isInputSkipToken = input === skipToken;
    const ssrOpts = useSSRQueryOptionsIfNeeded(queryKey, (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, defaultOpts), opts));
    const shouldAbortOnUnmount = (_opts$trpc$abortOnUnm5 = opts === null || opts === void 0 || (_opts$trpc7 = opts.trpc) === null || _opts$trpc7 === void 0 ? void 0 : _opts$trpc7.abortOnUnmount) !== null && _opts$trpc$abortOnUnm5 !== void 0 ? _opts$trpc$abortOnUnm5 : context.abortOnUnmount;
    usePrefetchInfiniteQuery((0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, opts), {}, {
      initialPageParam: (_opts$initialCursor2 = opts.initialCursor) !== null && _opts$initialCursor2 !== void 0 ? _opts$initialCursor2 : null,
      queryKey,
      queryFn: isInputSkipToken ? input : (queryFunctionContext) => {
        var _queryFunctionContext2;
        const actualOpts = (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts), {}, { trpc: (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts === null || ssrOpts === void 0 ? void 0 : ssrOpts.trpc), shouldAbortOnUnmount ? { signal: queryFunctionContext.signal } : {}) });
        return context.client.query(...getClientArgs(queryKey, actualOpts, {
          pageParam: (_queryFunctionContext2 = queryFunctionContext.pageParam) !== null && _queryFunctionContext2 !== void 0 ? _queryFunctionContext2 : opts.initialCursor,
          direction: queryFunctionContext.direction
        }));
      }
    }));
  }
  function useSuspenseInfiniteQuery$1(path, input, opts) {
    var _opts$trpc$abortOnUnm6, _opts$trpc8, _opts$initialCursor3;
    const context = useContext5();
    const queryKey = getQueryKeyInternal(path, input, "infinite");
    const defaultOpts = context.queryClient.getQueryDefaults(queryKey);
    const ssrOpts = useSSRQueryOptionsIfNeeded(queryKey, (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, defaultOpts), opts));
    const shouldAbortOnUnmount = (_opts$trpc$abortOnUnm6 = opts === null || opts === void 0 || (_opts$trpc8 = opts.trpc) === null || _opts$trpc8 === void 0 ? void 0 : _opts$trpc8.abortOnUnmount) !== null && _opts$trpc$abortOnUnm6 !== void 0 ? _opts$trpc$abortOnUnm6 : context.abortOnUnmount;
    const hook = useSuspenseInfiniteQuery((0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, opts), {}, {
      initialPageParam: (_opts$initialCursor3 = opts.initialCursor) !== null && _opts$initialCursor3 !== void 0 ? _opts$initialCursor3 : null,
      queryKey,
      queryFn: (queryFunctionContext) => {
        var _queryFunctionContext3;
        const actualOpts = (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts), {}, { trpc: (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, ssrOpts === null || ssrOpts === void 0 ? void 0 : ssrOpts.trpc), shouldAbortOnUnmount ? { signal: queryFunctionContext.signal } : {}) });
        return context.client.query(...getClientArgs(queryKey, actualOpts, {
          pageParam: (_queryFunctionContext3 = queryFunctionContext.pageParam) !== null && _queryFunctionContext3 !== void 0 ? _queryFunctionContext3 : opts.initialCursor,
          direction: queryFunctionContext.direction
        }));
      }
    }), context.queryClient);
    hook.trpc = useHookResult({ path });
    return [hook.data, hook];
  }
  const useQueries$1 = (queriesCallback, options) => {
    const { ssrState, queryClient, prefetchQuery, client } = useContext5();
    const proxy = createUseQueries(client);
    const queries = queriesCallback(proxy);
    if (typeof window === "undefined" && ssrState === "prepass") for (const query of queries) {
      var _queryOption$trpc;
      const queryOption = query;
      if (((_queryOption$trpc = queryOption.trpc) === null || _queryOption$trpc === void 0 ? void 0 : _queryOption$trpc.ssr) !== false && !queryClient.getQueryCache().find({ queryKey: queryOption.queryKey })) prefetchQuery(queryOption.queryKey, queryOption);
    }
    return useQueries({
      queries: queries.map((query) => (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, query), {}, { queryKey: query.queryKey })),
      combine: options === null || options === void 0 ? void 0 : options.combine
    }, queryClient);
  };
  const useSuspenseQueries$1 = (queriesCallback) => {
    const { queryClient, client } = useContext5();
    const proxy = createUseQueries(client);
    const queries = queriesCallback(proxy);
    const hook = useSuspenseQueries({ queries: queries.map((query) => (0, import_objectSpread211.default)((0, import_objectSpread211.default)({}, query), {}, {
      queryFn: query.queryFn,
      queryKey: query.queryKey
    })) }, queryClient);
    return [hook.map((h) => h.data), hook];
  };
  return {
    Provider: TRPCProvider,
    createClient,
    useContext: useContext5,
    useUtils: useContext5,
    useQuery: useQuery$1,
    usePrefetchQuery: usePrefetchQuery$1,
    useSuspenseQuery: useSuspenseQuery$1,
    useQueries: useQueries$1,
    useSuspenseQueries: useSuspenseQueries$1,
    useMutation: useMutation$1,
    useSubscription,
    useInfiniteQuery: useInfiniteQuery$1,
    usePrefetchInfiniteQuery: usePrefetchInfiniteQuery$1,
    useSuspenseInfiniteQuery: useSuspenseInfiniteQuery$1
  };
}

// ../node_modules/@trpc/react-query/dist/index.mjs
var React9 = __toESM(require_react(), 1);
function createHooksInternal(trpc2) {
  const proxy = createReactDecoration(trpc2);
  return createFlatProxy((key) => {
    if (key === "useContext" || key === "useUtils") return () => {
      const context = trpc2.useUtils();
      return React9.useMemo(() => {
        return createReactQueryUtils(context);
      }, [context]);
    };
    if (trpc2.hasOwnProperty(key)) return trpc2[key];
    return proxy[key];
  });
}
function createTRPCReact(opts) {
  const hooks = createRootHooks(opts);
  const proxy = createHooksInternal(hooks);
  return proxy;
}

// src/lib/demo-mode.ts
var isDemoMode = () => {
  return typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && !window.location.port;
};
var demoData = {
  user: {
    id: "demo-user",
    name: "Demo User",
    email: "demo@krushr.com",
    avatar: void 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  workspaces: [
    {
      id: "demo-workspace",
      name: "Demo Workspace",
      description: "Experience Krushr's features",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      ownerId: "demo-user",
      _count: {
        projects: 3,
        teams: 2,
        kanbans: 1,
        tasks: 3,
        members: 1
      }
    }
  ],
  workspaceMembers: [
    {
      id: "demo-member-1",
      userId: "demo-user",
      workspaceId: "demo-workspace",
      role: "owner",
      name: "Demo User",
      email: "demo@krushr.com",
      avatar: void 0,
      user: {
        id: "demo-user",
        name: "Demo User",
        email: "demo@krushr.com",
        avatar: void 0
      }
    }
  ],
  panels: [
    {
      id: "demo-panel-1",
      name: "Demo Panel",
      type: "kanban",
      workspaceId: "demo-workspace",
      layout: { x: 0, y: 0, w: 12, h: 8 },
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  activities: [
    {
      id: "demo-activity-1",
      type: "task_created",
      message: "Demo task created",
      workspaceId: "demo-workspace",
      userId: "demo-user",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  layoutPresets: [
    {
      id: "demo-preset-1",
      name: "Default Layout",
      workspaceId: "demo-workspace",
      layout: [],
      isDefault: true
    }
  ],
  chatThreads: [
    {
      id: "demo-thread-1",
      name: "General Discussion",
      workspaceId: "demo-workspace",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  kanbans: [
    {
      id: "demo-kanban-1",
      name: "Demo Project Board",
      workspaceId: "demo-workspace",
      createdById: "demo-user",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      columns: [
        { id: "col-1", name: "Todo", position: 0 },
        { id: "col-2", name: "In Progress", position: 1 },
        { id: "col-3", name: "Done", position: 2 }
      ]
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Welcome to Krushr!",
      description: "This is a demo task. In the full version, you can create, edit, and manage tasks with your team.",
      status: "todo",
      priority: "high",
      workspaceId: "demo-workspace",
      createdById: "demo-user",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "task-2",
      title: "Explore the Kanban Board",
      description: "Drag and drop tasks between columns. Full version includes real-time collaboration.",
      status: "in_progress",
      priority: "medium",
      workspaceId: "demo-workspace",
      createdById: "demo-user",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "task-3",
      title: "Try the Calendar View",
      description: "Schedule tasks and meetings. Backend required for full functionality.",
      status: "done",
      priority: "low",
      workspaceId: "demo-workspace",
      createdById: "demo-user",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  notes: [
    {
      id: "note-1",
      title: "Welcome to Notes",
      content: "<p>This is a demo note. The full version includes rich text editing, folders, and real-time collaboration.</p>",
      workspaceId: "demo-workspace",
      createdById: "demo-user",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  notifications: []
};
var mockDelay = () => new Promise((resolve) => setTimeout(resolve, 300));
var demoResponses = {
  "user.me": async () => {
    await mockDelay();
    return { result: { data: demoData.user } };
  },
  "auth.login": async () => {
    await mockDelay();
    return {
      result: {
        data: {
          token: "demo-token",
          user: demoData.user
        }
      }
    };
  },
  "workspace.list": async () => {
    await mockDelay();
    console.log("[Demo Mode] Returning workspace data with _count structure");
    return { result: { data: demoData.workspaces } };
  },
  "workspace.get": async () => {
    await mockDelay();
    return { result: { data: demoData.workspaces[0] } };
  },
  "user.listWorkspaceMembers": async () => {
    await mockDelay();
    return { result: { data: demoData.workspaceMembers } };
  },
  "kanban.list": async () => {
    await mockDelay();
    return { result: { data: demoData.kanbans } };
  },
  "panel.list": async () => {
    await mockDelay();
    return { result: { data: demoData.panels } };
  },
  "workspace.findById": async () => {
    await mockDelay();
    return { result: { data: demoData.workspaces[0] } };
  },
  "activity.getRecent": async () => {
    await mockDelay();
    return { result: { data: demoData.activities } };
  },
  "layout.listPresets": async () => {
    await mockDelay();
    return { result: { data: demoData.layoutPresets } };
  },
  "chat.listThreads": async () => {
    await mockDelay();
    return { result: { data: demoData.chatThreads } };
  },
  "task.list": async () => {
    await mockDelay();
    return { result: { data: demoData.tasks } };
  },
  "task.create": async () => {
    await mockDelay();
    const newTask = {
      ...demoData.tasks[0],
      id: `task-${Date.now()}`,
      title: "New Demo Task",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return { result: { data: newTask } };
  },
  "task.update": async () => {
    await mockDelay();
    return { result: { data: { ...demoData.tasks[0], updatedAt: (/* @__PURE__ */ new Date()).toISOString() } } };
  },
  "notes.list": async () => {
    await mockDelay();
    return { result: { data: demoData.notes } };
  },
  "notification.list": async () => {
    await mockDelay();
    return { result: { data: demoData.notifications } };
  }
};
var extractProcedure = (url) => {
  const match = url.match(/\/trpc\/([^?]+)/);
  return match ? match[1] : "";
};

// src/lib/trpc.ts
var trpc = createTRPCReact();
function getAuthToken() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (!token && true) {
      localStorage.setItem("auth-token", "dev-token-123");
      return "dev-token-123";
    }
    return token;
  }
  return null;
}
function getApiUrl() {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `${window.location.origin}/api/trpc`;
  }
  return "http://127.0.0.1:3002/trpc";
}
var demoFetch = async (input, init) => {
  if (isDemoMode() && typeof input === "string") {
    const procedure = extractProcedure(input);
    const handler = demoResponses[procedure];
    if (handler) {
      console.log(`[Demo Mode] Intercepting ${procedure}`);
      const data = await handler();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  return fetch(input, init);
};
var trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: () => true
    }),
    httpLink({
      url: getApiUrl(),
      fetch: demoFetch,
      headers() {
        const token = getAuthToken();
        const apiUrl = getApiUrl();
        const origin = apiUrl.includes("localhost") ? "http://127.0.0.1:8001" : window.location.origin;
        return {
          ...token ? { authorization: `Bearer ${token}` } : {},
          "Origin": origin
        };
      }
    })
  ]
});

export {
  QueryClient,
  useQueryClient,
  QueryClientProvider,
  isDemoMode,
  demoResponses,
  trpc,
  trpcClient
};
/*! Bundled license information:

@trpc/client/dist/httpLink-CYOcG9kQ.mjs:
  (* istanbul ignore if -- @preserve *)

@trpc/react-query/dist/shared-JtnEvJvB.mjs:
  (* istanbul ignore next -- @preserve *)
*/
//# sourceMappingURL=/chunks/chunk-OQODX37F.js.map
