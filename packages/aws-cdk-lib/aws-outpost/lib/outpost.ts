import { Construct } from 'constructs';
import * as cxschema from '../../cloud-assembly-schema';
import { ContextProvider, Token } from '../../core';
import * as cxapi from '../../cx-api';
/**
 * Interface for an classes that import Outpost
 */
export interface IOutpost {
  /**
   * The ID of the Outpost
   */
  readonly outpostId: string;

  /**
   * The ARN of the Outpost
   */
  readonly outpostArn: string;

  /**
   * The ARN of the Outpost
   */
  readonly name: string;

  /**
   * The availability zone of the Outpost
   */
  readonly availabilityZone: string;
}

/**
 * Interface for attributes to use when looking up an Outpost
 */
export interface OutpostAttributes {
  /**
   * The ID of the Outpost
   */
  readonly outpostId: string;

  /**
   * The ARN of the Outpost
   */
  readonly outpostArn: string;

  /**
   * The ARN of the Outpost
   */
  readonly name: string;

  /**
   * The availability zone of the Outpost
   */
  readonly availabilityZone: string;
}

/**
 * Properties for looking up an Outpost
 */
export interface OutpostLookupOptions {
  /**
   * The ID of the Outpost
   */
  readonly outpostId: string;

  /**
   * Optional to override inferred region
   *
   * @default Current stack's environment region
   */
  readonly region?: string;
}

/**
 * Define an AWS Outpost
 *
 * For example:
 *
 * ```ts
 * const lgw = ec2.Outpost.fromLookup(this, 'MyOutpost', {
        outpostId: 'arn:aws:outpost:us-west-2:my-account:outpost/op-xxxxxx',
 * });
 *
 */
export class Outpost implements IOutpost {
  /**
     * Import an existing Outpost by querying the AWS environment this stack is deployed to.
     *
     * This function needs to be used to reference Local Gateways that are required
     * in your CDK application.
     *
     * Calling this method will lead to a lookup when the CDK CLI is executed.
     * You can therefore not use any values that will only be available at
     * CloudFormation execution time (i.e., Tokens).
     *
     * The Outpost information will be cached in `cdk.context.json` and the same Outpost
     * will be used on future runs. To refresh the lookup, you will have to
     * evict the value from the cache using the `cdk context` command. See
     * https://docs.aws.amazon.com/cdk/latest/guide/context.html for more information.
     */
  public static fromLookup(scope: Construct, options: OutpostLookupOptions): IOutpost {
    if (Token.isUnresolved(options.outpostId)) {
      throw new Error('All arguments to Outpost.fromLookup() must be concrete (no Tokens)');
    }

    const overrides: { [key: string]: string } = {};
    if (options.region) {
      overrides.region = options.region;
    }

    const attributes: cxapi.OutpostContextResponse = ContextProvider.getValue(scope, {
      provider: cxschema.ContextProvider.OUTPOST_PROVIDER,
      props: {
        ...overrides,
        outpostId: options.outpostId,
      } as cxschema.OutpostContextQuery,
      dummyValue: undefined,
    }).value;

    return new Outpost({
      outpostId: attributes.outpostId,
      outpostArn: attributes.outpostArn,
      name: attributes.name,
      availabilityZone: attributes.availabilityZone,
    });
  }

  /**
     * The ID of the Outpost
     */
  public readonly outpostId: string;

  /**
     * The ARN of the Outpost
     */
  public readonly outpostArn: string;

  /**
     * Name of the Outpost
     */
  public readonly name: string;

  /**
     * Availability Zone the Outpost is connected to
     */
  public readonly availabilityZone: string;

  constructor(props: OutpostAttributes) {
    this.outpostId = props.outpostId;
    this.outpostArn = props.outpostArn;
    this.name = props.name;
    this.availabilityZone = props.availabilityZone;
  }
}
