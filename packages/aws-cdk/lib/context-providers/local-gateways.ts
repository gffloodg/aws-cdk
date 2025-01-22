import type { LocalGatewayContextQuery } from '@aws-cdk/cloud-assembly-schema';
import { type LocalGatewayContextResponse } from '@aws-cdk/cx-api';
import type { Filter, LocalGateway } from '@aws-sdk/client-ec2';
import { type IEC2Client, initContextProviderSdk, type SdkProvider } from '../api';
import { ContextProviderPlugin } from '../api/plugin';
import { debug } from '../logging';

export class LocalGatewayContextProviderPlugin implements ContextProviderPlugin {
  constructor(private readonly aws: SdkProvider) {}

  public async getValue(args: LocalGatewayContextQuery) {
    const ec2 = (await initContextProviderSdk(this.aws, args)).ec2();

    const localGateway = await this.findLocalGateway(ec2, args);

    return this.findLocalGatewayRouteTables(ec2, localGateway, args);
  }

  private async findLocalGateway(
    ec2: IEC2Client,
    args: LocalGatewayContextQuery,
  ): Promise<LocalGateway> {
    // Build request filter (map { Name -> Value } to list of [{ Name, Values }])
    const filters: Filter[] = Object.entries(args.filter).map(([tag, value]) => ({
      Name: tag,
      Values: [value],
    }));

    debug(`Listing Local Gateways in ${args.account}:${args.region}`);
    const response = await ec2.describeLocalGateways({ Filters: filters });

    const localGateways = response.LocalGateways || [];
    if (localGateways.length === 0) {
      throw new Error(`Could not find any Local Gateways matching ${JSON.stringify(args)}`);
    }
    if (localGateways.length > 1) {
      throw new Error(
        `Found ${localGateways.length} Local Gateways matching ${JSON.stringify(
          args,
        )}; please narrow the search criteria`,
      );
    }
    const localGateway = localGateways[0];
    debug(`Chosen Local Gateway ${JSON.stringify(localGateway)}`);

    return {
      LocalGatewayId: localGateway.LocalGatewayId!,
      OutpostArn: localGateway.OutpostArn!,
      State: localGateway.State!,
      OwnerId: localGateway.OwnerId!,
    };
  }

  private async findLocalGatewayRouteTables(
    ec2: IEC2Client,
    localGateway: LocalGateway,
    args: LocalGatewayContextQuery,
  ): Promise<LocalGatewayContextResponse> {
    const localGatewayId = localGateway.LocalGatewayId!;

    const filters = { Filters: [{ Name: 'local-gateway-id', Values: [localGatewayId] }] };

    debug(`Listing Local Gateway Route Tables in ${args.account}:${args.region}`);
    const response = await ec2.describeLocalGatewayRouteTables(filters);
    const routeTableIds =
        response.LocalGatewayRouteTables?.filter((table) => table.State === 'available')
          .map((table) => table.LocalGatewayRouteTableId)
          .filter((id): id is string => id !== undefined && id !== null) ?? [];

    return {
      localGatewayId: localGatewayId,
      localGatewayRouteTableIds: routeTableIds,
      outpostArn: localGateway.OutpostArn!,
      state: localGateway.State!,
      ownerId: localGateway.OwnerId!,
    };
  }
}
