/**
 * Properties of a discovered Local Gateway
 */
export interface LocalGatewayContextResponse {
  /**
   * The ID of the Local Gateway
   */
  readonly localGatewayId: string;

  /**
   * The ARN of the Outpost associated with this Local Gateway
   */
  readonly outpostArn: string;

  /**
   * The owner account ID of the Local Gateway
   */
  readonly ownerId: string;

  /**
   * The state of the Local Gateway
   */
  readonly state: string;

  /**
   * List of Local Gateway Route Table Ids associated with this Local Gateway that are currently Available
   *
   * NOTE: A Local Gateway Route Table state is managed by the AWS Service team. Only Available LGW Route Tables can be used.
   */
  readonly localGatewayRouteTableIds: string[];
}
