/* eslint-disable node/no-unpublished-import */
import axios, {Method} from 'axios';
import config from '../config/config.json';
import {DNSRecord, Zone, Domain} from '@cloudflare/types';

async function request(
  endpoint: string,
  method: Method,
  body?: object,
  params?: object
) {
  try {
    const baseUrl = 'https://api.cloudflare.com/client/v4';
    const {data} = await axios({
      url: `${baseUrl}${endpoint}`,
      method,
      headers: {
        'X-Auth-Email': config.cloudflare.email,
        'X-Auth-Key': config.cloudflare.apiKey,
        'Content-Type': 'application/json',
      },
      data: body ? body : null,
      params: params ? params : null,
    });

    return data;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Get all cloudflare zones.
 *
 * @export
 * @param {number} [page=1] - The page number.
 * @return {*} The list of zones
 */
export async function fetchAllZones(page = 1): Promise<Zone[]> {
  const data = await request(
    '/zones',
    'GET',
    {},
    {
      per_page: 50,
      page: page,
      'account.id': config.cloudflare.accountId,
    }
  );

  if (page <= data.result_info.total_pages) {
    data.result = data.result.concat(await fetchAllZones(page + 1));
  }

  return data.result;
}

export async function deleteZone(id: string) {
  return await request(`/zones/${id}`, 'DELETE');
}

export async function getDnsRecords(id: string): Promise<DNSRecord[]> {
  return (await request(`/zones/${id}/dns_records`, 'GET')).result;
}

export async function deleteDNSZone(zoneid: string, recordId: string) {
  return await request(`/zones/${zoneid}/dns_records/${recordId}`, 'DELETE');
}

export async function createDNSRecord(
  zoneid: string,
  name: string,
  content: string,
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'SRV' | 'SPF' | 'NS' | 'CAA' | 'MX',
  proxied: boolean
) {
  return await request(`/zones/${zoneid}/dns_records`, 'POST', {
    type,
    name,
    content,
    ttl: 1,
    proxied,
  });
}

export async function getRegistrarInfo(domain: string): Promise<Domain> {
  return (
    await request(
      `/accounts/${config.cloudflare.accountId}/registrar/domains/${domain}`,
      'GET'
    )
  ).result;
}
