import { DbConfiguration } from "../models/db-configuration.model";

export class HelperService {
  public buildConnectionString(dbConfig : DbConfiguration) : string{
      if (dbConfig === undefined || dbConfig == null){
        throw new Error("The database configuration was undefined!");
      }

      var hostEq = `Host=${dbConfig.host}`;
      var portEq = `Port=${dbConfig.port}`;
      var userEq = `User=${dbConfig.user}`;
      var pwEq = `Pw=${dbConfig.password}`;
      var dbEq = `Db=${dbConfig.database}`;
      var eqs = [hostEq, portEq, userEq, pwEq, dbEq];
      var result = eqs.join(";");
      return result;
  }
}
