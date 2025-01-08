
/**
 * Properties for looking up an existing Local Gateway.
 *
 * The combination of properties must specify filter down to exactly one
 * Local Gateway, otherwise an error is raised.
 */
export interface LocalGatewayLookupOptions {
    /**
     * The ID of the Local Gateway.
     *
     * If given, will import exactly this Local Gateway.
     *
     * @default Don't filter on localGatewayId
     */
    readonly localGatewayId?: string;

    /**
     * The ARN of the outpost that this Local Gateway is attched to.
     *
     * If given, will import the Local Gateway attached to.
     *
     * @default Don't filter on outpostArn
     */
    readonly outpostArn?: string;
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
 * @resource none
 */
export class LocalGateway extends ILocalGateway {

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
    public static fromLookup(scope: Construct, id: string, options: LocalGatewayLookupOptions): ILocalGateway {
        if (Token.isUnresolved(options.localGatewayId)
            || Token.isUnresolved(options.outpostArn)) {
            throw new Error('All arguments to LocalGateway.fromLookup() must be concrete (no Tokens)');
        }

        const filter: {[key: string]: string} = makeTagFilter(options.tags);

        // We give special treatment to some tags
        if (options.outpostArn) { filter['outpost-arn'] = options.outpostArn; }

        const overrides: {[key: string]: string} = {};
        if (options.region) {
            overrides.region = options.region;
        }

        const attributes: cxapi.LgwContextResponse = ContextProvider.getValue(scope, {
            provider: cxschema.ContextProvider.LGW_PROVIDER,
            props: {
                ...overrides,
                filter,
            } as cxschema.LgwContextQuery,
            dummyValue: undefined,
        }).value;

        return new LookedUpLocalGateway(scope, id, attributes ?? DUMMY_LGW_PROPS, attributes === undefined);

        /**
         * Prefixes all keys in the argument with `tag:`.`
         */
        function makeTagFilter(tags: { [name: string]: string } | undefined): { [name: string]: string } {
            const result: { [name: string]: string } = {};
            for (const [name, value] of Object.entries(tags || {})) {
                result[`tag:${name}`] = value;
            }
            return result;
        }
    }

    // TODO
    /**
     * Identifier for this Local Gateway
     */
    public readonly localGatewayId: string;


}