import { DbConfiguration } from "../models/db-configuration.model";

/**
 * Represents the helper service.
 */
export class HelperService{
  /**
   * Gets a connection string based on the database configuration.
   * @param dbConfig The database configuration (data needed to establish connection to the database).
   * @returns The connection string.
   */
  public buildConnectionString(dbConfig: DbConfiguration): string{
      if (dbConfig === undefined || dbConfig == null){
        throw new Error("The database configuration was undefined!");
      }

      var hostEq = `Host=${dbConfig.host}`;
      var portEq = `Port=${dbConfig.port}`;
      var userEq = `User=${dbConfig.user}`;
      var pwEq = `Pw=${dbConfig.password}`;
      var dbEq = `Db=${dbConfig.database}`;
      var providerEq = `Provider=${dbConfig.dbProvider}`;
      var eqs = [hostEq, portEq, userEq, pwEq, dbEq, providerEq];
      var result = eqs.join(";");
      return result;
  }
}
