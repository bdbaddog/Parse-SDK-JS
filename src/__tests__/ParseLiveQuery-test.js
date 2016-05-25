/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../ParseLiveQuery');
jest.dontMock('../CoreManager');
jest.dontMock('../ParsePromise');
jest.dontMock('../LiveQueryClient');
jest.dontMock('../ParseObject');

jest.dontMock('./test_helpers/asyncHelper');

const ParseLiveQuery = require('../ParseLiveQuery');
const CoreManager = require('../CoreManager');
const ParsePromise = require('../ParsePromise');

const asyncHelper = require('./test_helpers/asyncHelper');

describe('ParseLiveQuery', () => {
  beforeEach(() => {
    const controller = CoreManager.getLiveQueryController();
    controller._clearCachedDefaultClient();
  });

  it('fails with an invalid livequery server url', asyncHelper((done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as(undefined);
      }
    });
    CoreManager.set('LIVEQUERY_SERVER_URL', 'notaurl');
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().fail((err) => {
      expect(err.message).toBe(
        'You need to set a proper Parse LiveQuery server url before using LiveQueryClient'
      );
      done();
    });
  }));

  it('initializes the client', asyncHelper((done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as(undefined);
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('LIVEQUERY_SERVER_URL', 'wss://live.example.com/parse');
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().then((client) => {
      expect(client.serverURL).toBe('wss://live.example.com/parse');
      expect(client.applicationId).toBe('appid');
      expect(client.javascriptKey).toBe('jskey');
      expect(client.sessionToken).toBe(undefined);
      done();
    });
  }));

  it('automatically generates a websocket url', asyncHelper((done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as(undefined);
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('LIVEQUERY_SERVER_URL', null);
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().then((client) => {
      expect(client.serverURL).toBe('wss://api.parse.com/1');
      expect(client.applicationId).toBe('appid');
      expect(client.javascriptKey).toBe('jskey');
      expect(client.sessionToken).toBe(undefined);
      done();
    });
  }));

  it('populates the session token', asyncHelper((done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as({
          getSessionToken() {
            return 'token';
          }
        });
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('LIVEQUERY_SERVER_URL', null);
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().then((client) => {
      expect(client.serverURL).toBe('wss://api.parse.com/1');
      expect(client.applicationId).toBe('appid');
      expect(client.javascriptKey).toBe('jskey');
      expect(client.sessionToken).toBe('token');
      done();
    });
  }));
});
