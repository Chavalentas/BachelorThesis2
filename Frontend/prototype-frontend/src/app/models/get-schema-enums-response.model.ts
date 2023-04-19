import { DbObject } from "./db-object.model";

/**
 * Represents the HTTP response of a request that gets the database schema enumerations.
 */
export interface GetSchemaEnumsResponse{
  /**
   * Represents the object containing an array of the database objects.
   */
   result:  Array<DbObject>;
}
