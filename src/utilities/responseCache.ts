import { NextFunction, Request, Response } from "express";
import { md5 } from "./hash";

interface PromiseRef {
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
}

const data: { [key: string]: PromiseRef } = {};
const timerRefs: { [key: string]: NodeJS.Timeout } = {};

const createPromise = (key: string, duration: number) => {
  clearTimeout(timerRefs[key]);
  timerRefs[key] = setTimeout(() => {
    delete data[key];
    delete timerRefs[key];
  }, duration);

  const promiseRef: any = {};
  promiseRef.promise = new Promise((resolve) => {
    promiseRef.resolve = resolve;
  });
  data[key] = promiseRef;
};

const getPromise = (key: string): Promise<unknown> => {
  return data[key]?.promise;
};

const resolvePromise = (key: string, value: unknown): void => {
  data[key].resolve(value);
};

const responseCache = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key =
      "__Super_Duper_Cache__" +
      md5(JSON.stringify([req.originalUrl, req.body]));

    const promise = getPromise(key);
    if (promise) {
      res.send(await promise);
    } else {
      // Create promise.
      createPromise(key, duration);

      // Save response and send.
      const sendResponse = res.send;
      res.send = (body) => {
        resolvePromise(key, body);
        res.send = sendResponse;
        return res.send(body);
      };

      next();
    }
  };
};

export default responseCache;
