/**
 * Represents the database configuration.
 */
export interface DbConfiguration{
  /**
   * Represents the host name.
   */
  host: string;

  /**
   * Represents the port number.
   */
  port: number;

  /**
   * Represents the user name.
   */
  user: string;

  /**
   * Represents the password.
   */
  password: string;

  /**
   * Represents the database name.
   */
  database: string;

  /**
   * Represents the database provider.
   */
  dbProvider: string;
}
