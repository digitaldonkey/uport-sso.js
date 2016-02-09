import { getToken, generateIdentity, generateAddress } from './utils';
import Api from './api';

// FIXME: better argument handling
export default class uPortID {
  constructor(_identifier, { apiHost = 'http://localhost', apiPort = '5001', apiPath = '/api/v0/keystore/' } = {}) {
    this._api = new Api({ apiHost, apiPort, apiPath, _identifier });
    this._identifier = _identifier;
    this._json = null;
  }

  login(_password) {
    return getToken(this._identifier, _password)
      .then(_token => this._api.get(_token));
  }

  register(_password) {
    return generateIdentity(this._identifier, _password)
      .then(_json => this._api.put(_json));
  }

  validate(_password, _secret) {
    return getToken(this._identifier, _password)
      .then(_token => this._api.post({ token: _token, secret: _secret }));
  }

  generate(_password, _seed, _entropy) {
    return getToken(this._identifier, _password)
      .then(_token => this._api.get(_token))
      .then(_json => {
        if (_json.keystore !== null) {
          throw new Error('Keysore already generated');
        }

        return generateAddress(_password, _seed, _entropy)
          .then(keystore => Object.assign({}, _json, { keystore }));
      })
      .then(_json => this._api.put(_json));
  }

  migrate(_password, _seed) {
    return this.generate(_password, _seed, '');
  }

  // changePassword(_identifier, _password, _seed) {
  //  return this.generate(_identifier, _password, _seed, '');
  // }

  remove(_password) {
    return getToken(this._identifier, _password)
      .then(_token => this._api.remove(this._identifier, _token));
  }
}