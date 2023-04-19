/**
 * Represents the HTTP response of a request that gets the database provider.
 */
export interface GetDbProviderResponse{
  /**
   * An array containing the name of the database provider.
   */
   result:  Array<string>;
}
