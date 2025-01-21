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
     */
  readonly availableLocalGatewayRouteTableIds: string[];
}
