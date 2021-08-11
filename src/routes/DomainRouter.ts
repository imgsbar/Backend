import {FastifyInstance} from 'fastify';
import {authHandler} from '../handlers/AuthHandler';
import {
  createDNSRecord,
  deleteDNSZone,
  deleteZone,
  fetchAllZones,
  getDnsRecords,
  getRegistrarInfo,
} from '../util/Cloudflare';
import colors from '../util/colors.json';
import {sendDomainLog} from '../util/LogUtil';
import {deletev1Domain} from '../util/v1Util';
import {Domain} from './../documents/Domain';
import {EmbedBuilder} from './../util/Embed';
import config from '../config/config.json';

export const defaultDnsRecords = [
  {
    name: '*.{domain}',
    type: 'CNAME',
    proxied: false,
    content: '{domain}',
  },
  {
    name: '{domain}',
    type: 'CNAME',
    proxied: true,
    content: 'i.imgs.bar',
  },
];
export default async function DomainRouter(router: FastifyInstance) {
  router.get('/list', {preHandler: authHandler}, async (req, res) => {
    const domains = await Domain.find().select('domain _id setup approved');

    return res.send({domains});
  });
}

export async function checkDomains() {
  const cfzones = await fetchAllZones();
  for (const zone of cfzones) {
    if (
      config.ignoredDomains.includes(zone.name) ||
      zone.name.endsWith('.ga')
    ) {
      return;
    }

    if (zone.status !== 'active') {
      const embed = new EmbedBuilder()
        .setTitle(`${zone.name} Removed from the account`)
        .setColor(colors.cloudflare)
        .setDescription(
          `Zone ${zone.name} has been removed from the Cloudflare account.`
        )
        .addField('Zone ID', `\`\`\`${zone.id}\`\`\``, true)
        .addField('Zone Status', `\`\`\`${zone.status}\`\`\``, true)
        .addField('Registrar', `\`\`\`${zone.original_registrar}\`\`\``, true)
        .addField('Zone Created At', `\`\`\`${zone.created_on}\`\`\``, true);

      try {
        await sendDomainLog(embed);

        await deleteZone(zone.id);
        await deletev1Domain(zone.name);
      } catch (_err) {
        return;
      }
    } else {
      const domainData = await getRegistrarInfo(zone.name);
      let domain = await Domain.findOne({_id: zone.id});

      if (!domain) {
        domain = await Domain.create({
          _id: zone.id,
          domain: zone.name,
          nameservers: zone.name_servers,
          private: false,
          expiresAt: domainData.expires_at
            ? Date.parse(domainData.expires_at!)
            : null,
        });

        const dnsZones = await getDnsRecords(zone.id);
        const mappedZones = dnsZones.map(z => {
          return {
            name: z.name.replace(z.zone_name!, '{domain}'),
            type: z.type,
            proxied: z.proxied,
            content: z.content!.replace(z.zone_name!, '{domain}'),
          };
        });

        if (mappedZones.toString() !== defaultDnsRecords.toString()) {
          for (const zone of dnsZones) {
            await deleteDNSZone(zone.zone_id!, zone.id!);
          }

          for (const dnsRecord of defaultDnsRecords) {
            await createDNSRecord(
              zone.id!,
              dnsRecord.name.replace('{domain}', '').replace('.', ''),
              dnsRecord.content.replace('{domain}', zone.name),
              'CNAME',
              dnsRecord.proxied
            );
          }

          await sendDomainLog(
            new EmbedBuilder()
              .setTitle(`Added ${zone.name} & Updated DNS records`)
              .setColor(colors.success)
              .setDescription(
                `Zone ${zone.name} has been found, added it to database and updated DNS records`
              )
              .addField('Zone ID', `\`\`\`${zone.id}\`\`\``, false)
              .addField('Zone Name', `\`\`\`${zone.name}\`\`\``, false)
              .addField(
                'Zone Created At',
                `\`\`\`${zone.created_on}\`\`\``,
                false
              )
              .addField(
                'Domain Expires At',
                `\`\`\`${
                  domain.expiresAt ? domain.expiresAt : 'Not supported.'
                }\`\`\``,
                false
              )
          );
        } else {
          await sendDomainLog(
            new EmbedBuilder()
              .setTitle(`Added ${zone.name}`)
              .setColor(colors.success)
              .setDescription(
                `Zone ${zone.name} has been found, added it to database, the dns records are correct so no need to update.`
              )
              .addField('Zone ID', `\`\`\`${zone.id}\`\`\``, false)
              .addField('Zone Name', `\`\`\`${zone.name}\`\`\``, false)
              .addField(
                'Zone Created At',
                `\`\`\`${zone.created_on}\`\`\``,
                false
              )
              .addField(
                'Domain Expires At',
                `\`\`\`${
                  domain.expiresAt ? domain.expiresAt : 'Not supported.'
                }\`\`\``,
                false
              )
          );
        }
      }
    }
  }
}

export const autoPrefix = '/domains';
