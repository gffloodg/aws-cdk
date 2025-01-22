import type { OutpostContextQuery } from '@aws-cdk/cloud-assembly-schema';
import type { OutpostContextResponse } from '@aws-cdk/cx-api';
import { type IOutpostsClient, initContextProviderSdk, type SdkProvider } from '../api';

import { ContextProviderPlugin } from '../api/plugin';
import { debug } from '../logging';

export class OutpostContextProviderPlugin implements ContextProviderPlugin {
  constructor(private readonly aws: SdkProvider) {}

  public async getValue(args: OutpostContextQuery) {
    const outpost = (await initContextProviderSdk(this.aws, args)).outpost();

    return this.getOutpost(outpost, args);
  }

  private async getOutpost(
    outposts: IOutpostsClient,
    args: OutpostContextQuery,
  ): Promise<OutpostContextResponse> {
    debug(`Retrieving Outpost ${args.outpostId} in ${args.account}:${args.region}`);
    const response = await outposts.getOutpost({ OutpostId: args.outpostId });

    const outpost = response.Outpost;

    if (!outpost) {
      throw new Error(`No Outpost found for ${args.outpostId}`);
    }

    return {
      outpostId: outpost.OutpostId!,
      outpostArn: outpost.OutpostArn!,
      ownerId: outpost.OwnerId!,
      name: outpost.Name!,
      siteId: outpost.SiteId!,
      description: outpost.Description!,
      lifeCycleStatus: outpost.LifeCycleStatus!,
      availabilityZone: outpost.AvailabilityZone!,
      availabilityZoneId: outpost.AvailabilityZone!,
      tags: outpost.Tags!,
      siteArn: outpost.SiteArn!,
      supportedHardwareType: outpost.SupportedHardwareType!,
    };
  }
}
