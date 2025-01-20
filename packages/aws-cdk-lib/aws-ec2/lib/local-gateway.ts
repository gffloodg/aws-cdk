import { Construct } from 'constructs';
import * as cxschema from '../../cloud-assembly-schema';
import { ContextProvider, Token } from '../../core';
import * as cxapi from '../../cx-api';

/**
 * Interface for an classes that import Local Gateway
 */
export interface ILocalGateway {
  /**
   * Identifier for this Local Gateway
   */
  readonly localGatewayId: string;

  /**
   * ID of the Outpost connected to this Local Gateway
   */
  readonly outpostArn: string;

  /**
   * State of the Local Gateway association
   */
  readonly state: string;

  /**
   * ID of the account that owns the Local Gateway
   */
  readonly ownerId: string;
}

/**
 * Interface for attributes to use when looking up a Local Gateway
 */
export interface LocalGatewayAttributes {
  /**
   * Identifier for this Local Gateway
   */
  readonly localGatewayId: string;

  /**
   * ARN of the Outpost connected to this Local Gateway
   */
  readonly outpostArn: string;

  /**
   * State of the Local Gateway association
   */
  readonly state: string;

  /**
   * ID of the account that owns the Local Gateway
   */
  readonly ownerId: string;
}

/**
 * Properties for looking up an existing Local Gateway.
 *
 * The combination of properties specified must filter down to exactly one
 * Local Gateway, otherwise an error is raised.
 */
export interface LocalGatewayLookupOptions {
  /**
     * The ID of the Local Gateway.
     *
     * If given, will import exactly this Local Gateway.
     *
     * @default - Don't filter on localGatewayId
     */
  readonly localGatewayId?: string;

  /**
     * The ARN of the outpost that this Local Gateway is attched to.
     *
     * If given, will import the Local Gateway attached to.
     *
     * @default - Don't filter on outpostArn
     */
  readonly outpostArn?: string;

  /**
     * Tags on the Local Gateway
     *
     * The Local Gateway must have all of these tags
     *
     * @default - Don't filter on tags
     */
  readonly tags?: { [key: string]: string };

  /**
     * Optional to override inferred region
     *
     * @default Current stack's environment region
     */
  readonly region?: string;
}

/**
 * Define an AWS Local Gateway
 *
 * For example:
 *
 * ```ts
 * const lgw = ec2.LocalGateway.fromLookup(this, 'MyLGW', {
        outpostArn: 'arn:aws:outpost:us-west-2:my-account:outpost/op-xxxxxx',
 * });
 *
 */
export class LocalGateway implements ILocalGateway {
  /**
     * Import an existing Local Gateway by querying the AWS environment this stack is deployed to.
     *
     * This function needs to be used to reference Local Gateways that are required
     * in your CDK application.
     *
     * Calling this method will lead to a lookup when the CDK CLI is executed.
     * You can therefore not use any values that will only be available at
     * CloudFormation execution time (i.e., Tokens).
     *
     * The Local Gateway information will be cached in `cdk.context.json` and the same Local Gateway
     * will be used on future runs. To refresh the lookup, you will have to
     * evict the value from the cache using the `cdk context` command. See
     * https://docs.aws.amazon.com/cdk/latest/guide/context.html for more information.
     */
  public static fromLookup(
    scope: Construct,
    options: LocalGatewayLookupOptions,
  ): ILocalGateway {
    if (Token.isUnresolved(options.localGatewayId) || Token.isUnresolved(options.outpostArn)) {
      throw new Error(
        'All arguments to LocalGateway.fromLookup() must be concrete (no Tokens)',
      );
    }

    const filter: { [key: string]: string } = makeTagFilter(options.tags);

    // We give special treatment to some tags
    if (options.outpostArn) {
      filter['outpost-arn'] = options.outpostArn;
    }
    if (options.localGatewayId) {
      filter['local-gateway-id'] = options.localGatewayId;
    }

    const overrides: { [key: string]: string } = {};
    if (options.region) {
      overrides.region = options.region;
    }

    const attributes: cxapi.LocalGatewayContextResponse = ContextProvider.getValue(scope, {
      provider: cxschema.ContextProvider.LOCAL_GATEWAY_PROVIDER,
      props: {
        ...overrides,
        filter,
      } as cxschema.LocalGatewayContextQuery,
      dummyValue: undefined,
    }).value;

    return new LocalGateway({
      localGatewayId: attributes.localGatewayId,
      outpostArn: attributes.outpostArn,
      ownerId: attributes.ownerId,
      state: attributes.state,
    });

    /**
     * Prefixes all keys in the argument with `tag:`.`
     */
    function makeTagFilter(tags: { [name: string]: string } | undefined): {
      [name: string]: string;
    } {
      const result: { [name: string]: string } = {};
      for (const [name, value] of Object.entries(tags || {})) {
        result[`tag:${name}`] = value;
      }
      return result;
    }
  }

  /**
    * Identifier for this Local Gateway
    */
  readonly localGatewayId: string;

  /**
    * ARN of the Outpost connected to this Local Gateway
    */
  readonly outpostArn: string;

  /**
    * State of the Local Gateway association
    */
  readonly state: string;

  /**
    * ID of the account that owns the Local Gateway
    */
  readonly ownerId: string;

  constructor(props: LocalGatewayAttributes) {
    this.localGatewayId = props.localGatewayId;
    this.outpostArn = props.outpostArn;
    this.state = props.state;
    this.ownerId = props.ownerId;
  }
}
