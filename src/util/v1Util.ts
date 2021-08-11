import Axios, {Method} from 'axios';
import config from '../config/config.json';

/**
 * Send request to v1 api
 *
 * @param {{
 *   endpoint: string;
 *   method: Method;
 *   body?: object;
 * }} data
 * @return {*}
 */
async function request(data: {
  endpoint: string;
  method: Method;
  body?: object;
}) {
  try {
    const BASE_URL = config.v1.backend;

    const res = await Axios({
      url: `${BASE_URL}${data.endpoint}`,
      method: data.method,
      headers: {
        Authorization: config.v1.botKey,
      },
      data: {
        ...data.body,
      },
    });

    return res.data;
  } catch (err) {
    // eslint-disable-next-line no-ex-assign
    err = err.response.data.error;

    throw new Error(`${err.charAt(0).toUpperCase() + err.slice(1)}.`);
  }
}

/**
 * Deletes a current domain
 * @param {string} name Name of the domain
 */
export async function deletev1Domain(name: string) {
  return await request({
    endpoint: `/domains/${name}`,
    method: 'DELETE',
  });
}
