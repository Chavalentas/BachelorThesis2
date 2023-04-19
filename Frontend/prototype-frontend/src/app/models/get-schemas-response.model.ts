import { Schema } from "./schema.model";

/**
 * Represents the HTTP response of a request that gets the database schemas.
 */
export interface GetSchemasResponse{
  /**
   * Represents the object containing an array of the schemas.
   */
   result:  Array<Schema>;
}
