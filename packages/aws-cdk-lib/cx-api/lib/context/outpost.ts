/**
 * Properties of a discovered Outpost
 */
export interface OutpostContextResponse {
  /**
   * The unique identifier of the Outpost
   */
  readonly outpostId: string;

  /**
   * The AWS account ID of the Outpost owner
   */
  readonly ownerId: string;

  /**
   * The Amazon Resource Name (ARN) of the Outpost
   */
  readonly outpostArn: string;

  /**
   * The identifier of the site associated with the Outpost
   */
  readonly siteId: string;

  /**
   * The name of the Outpost
   */
  readonly name: string;

  /**
   * A description of the Outpost
   */
  readonly description: string;

  /**
   * The current lifecycle status of the Outpost
   */
  readonly lifeCycleStatus: string;

  /**
   * The Availability Zone where the Outpost is located
   */
  readonly availabilityZone: string;

  /**
   * The unique identifier of the Availability Zone
   * Example: "use1-az2"
   */
  readonly availabilityZoneId: string;

  /**
   * The key-value pairs of tags assigned to the Outpost
   */
  readonly tags: Record<string, string>;

  /**
   * The Amazon Resource Name (ARN) of the site
   */
  readonly siteArn: string;

  /**
   * The supported hardware type for the Outpost
   */
  readonly supportedHardwareType: string;
}
