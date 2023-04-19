import httpsSchemaParserBackendConfig from '../../configuration/https-schema-parser-backend.config.json';
import httpsConfigGeneratorBackendConfig from '../../configuration/https-config-generator-backend.config.json';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { DbConfiguration } from 'src/app/models/db-configuration.model';
import { Schema } from 'src/app/models/schema.model';
import { createPortCorrectnessValidator } from 'src/app/validators/database-port.validator';
import { HelperService } from 'src/app/services/helper.service';
import { GetSchemasResponse } from 'src/app/models/get-schemas-response.model';
import { GetSchemaEnumsResponse } from 'src/app/models/get-schema-enums-response.model';
import { DbObject } from 'src/app/models/db-object.model';
import { map, Observable } from 'rxjs';
import { GetObjectInformationResponse } from 'src/app/models/get-object-information-response.model';
import { createPasswordCorrectnessValidator } from 'src/app/validators/password.validator';
import { createHostnameCorrectnessValidator } from 'src/app/validators/hostname.validator';
import { createUsernameCorrectnessValidator } from 'src/app/validators/user.validator';
import { createDatabaseCorrectnessValidator } from 'src/app/validators/database.validator';
import { MatDialog } from '@angular/material/dialog';
import { NodeRedInstanceDataDialogComponent } from '../node-red-instance-data-dialog/node-red-instance-data-dialog.component';
import { ImportFlowResponse } from 'src/app/models/import-flow-response.model';
import { MatSelectChange } from '@angular/material/select';
import { DefaultErrorMatcher } from 'src/app/error-state-matchers/default.error-matcher';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
/**
 * Represents the home component.
 */
export class HomeComponent implements OnInit{
  /**
   * Represents the JSON configuration (array of nodes).
   */
  private _jsonConfig: Array<any>;

  /**
   * Represents the database configuration (data needed to establish connection).
   */
  private _dbConfiguration: DbConfiguration;

  /**
   * Represents the database provider.
   */
  private _dbProvider: string = "";

  /**
   * Represents the connection string.
   */
  private _connString: string = "";

  /**
   * Represents the name of the REST-API.
   */
  private _restApiName: string = "";

  /**
   * Represents the default user for MSSQL.
   */
  private _mssqlDefaultUser: string = "sa";

  /**
   * Represents the default port of the MSSQL server.
   */
  private _mssqlDefaultPort: number = 1433;

  /**
   * Represents the default user for PostgreSQL.
   */
  private _postgresDefaultUser: string = "admin";

  /**
   * Represents the default port of the PostgreSQL server.
   */
  private _postgresDefaultPort: number = 5432;

  /**
   * Represents the object data.
   */
  private _objectData: any;

  /**
   * Represents the constructor.
   * @param _formBuilder The form builder.
   * @param _httpClient The HTTP client.
   * @param _helperService The helper service.
   * @param _dialog The dialog.
   */
  constructor(private _formBuilder: FormBuilder, private _httpClient: HttpClient, private _helperService: HelperService, private _dialog: MatDialog){
  this.selectedObjectType = "";
  this._dbConfiguration = {} as DbConfiguration;
  this._jsonConfig = [];
  this.selectedSchema = {schemaName: ""} as Schema;
  this.selectedDbObject = {dbObjectName: ""} as DbObject;
 }

 /**
  * Represents the stepper.
  */
  @ViewChild(MatStepper) stepper!: MatStepper;

  /**
   * Represents the error state matcher.
   */
  public matcher = new DefaultErrorMatcher();

  /**
   * Represents a boolean indicating whether the stepper is linear.
   */
  public isLinear = true;

  /**
   * Represents a boolean indicating whether the spinner is loading.
   */
  public loading = false;

  /**
   * Represents the first step (stepper) success message.
   */
  public firstStepSuccessMessage: string = "";

  /**
   * Represents the second step (stepper) success message.
   */
  public secondStepSuccessMessage: string = "";

  /**
   * Represents the third step (stepper) success message.
   */
  public thirdStepSuccessMessage: string = "";

  /**
   * Represents the fourth step (stepper) success message.
   */
  public fourthStepSuccessMessage: string = "";

  /**
   * Represents the fifth step (stepper) success message.
   */
  public fifthStepSuccessMessage: string = "";

  /**
   * Represents the sixth step (stepper) success message.
   */
  public sixthStepSuccessMessage: string = "";

  /**
   * Represents the schemas.
   */
  public schemas: Schema[] = [];

  /**
   * Represents the database objects.
   */
  public dbObjects: DbObject[] = [];

  /**
   * Represents the selected database object type.
   */
  public selectedObjectType: string;

  /**
   * Represents the selected schema.
   */
  public selectedSchema: Schema;

  /**
   * Represents the selected database object.
   */
  public selectedDbObject: DbObject;

  /**
   * Represents the first form group.
   */
  public firstFormGroup = this._formBuilder.group({
    hostNameControl: ["", [Validators.required, createHostnameCorrectnessValidator()]],
    portControl: ["", [Validators.required, createPortCorrectnessValidator()]],
    userControl: ["", [Validators.required, createUsernameCorrectnessValidator()]],
    passwordControl: ["", [Validators.required, createPasswordCorrectnessValidator()]],
    databaseControl: ["", [Validators.required, createDatabaseCorrectnessValidator()]],
    dbProviderControl: ["", [Validators.required]]
  });

  /**
   * Represents the second form group.
   */
  public secondFormGroup = this._formBuilder.group({
    schemaNameControl: ["", Validators.required]
  });

  /**
   * Represents the third form group.
   */
  public thirdFormGroup = this._formBuilder.group({
    dbObjectTypeControl: ["", Validators.required]
  });

  /**
   * Represents the fourth form group.
   */
  public fourthFormGroup = this._formBuilder.group({
    dbObjectControl: ["", Validators.required]
  });

  /**
   * Represents the fifth form group.
   */
  public fifthFormGroup = this._formBuilder.group({
    restApiNameControl: ["", Validators.required]
  });

  /**
   * Represents the sixth form group.
   */
  public sixthFormGroup = this._formBuilder.group({
    configurationControl: [""]
  });

  /**
   * Represents the ngOnInit.
   */
  ngOnInit(): void{
  }

  /**
   * Represents the ngAfterViewInit.
   */
  ngAfterViewInit(){
    this.stepper._getIndicatorType = () => "number";
  }

  /**
   * Handles the click on the 'Next' button in the database configuration step.
   * @returns Leaves the method.
   */
  public handleDatabaseConfigNextButtonClick(): void{
      this.firstFormGroup.markAllAsTouched();
      this.firstStepSuccessMessage = "";
      if (this.firstFormGroup.invalid){
        this.firstStepSuccessMessage = "Some of the input fields have wrong value!";
        return;
      }

      this._dbConfiguration.host = this.firstFormGroup?.get("hostNameControl")?.value;
      this._dbConfiguration.port = this.firstFormGroup?.get("portControl")?.value;
      this._dbConfiguration.user = this.firstFormGroup?.get("userControl")?.value;
      this._dbConfiguration.password = this.firstFormGroup?.get("passwordControl")?.value;
      this._dbConfiguration.database = this.firstFormGroup?.get("databaseControl")?.value;
      this._dbConfiguration.dbProvider = this.firstFormGroup?.get("dbProviderControl")?.value;
      this._connString = this._helperService.buildConnectionString(this._dbConfiguration);
      this._dbProvider = this.firstFormGroup?.get("dbProviderControl")?.value;

      this.loading = true;
      this.loadSchemas(httpsSchemaParserBackendConfig.conn).subscribe({
        next: (data) => {
          this.loading = false;
          if (data.result.length == 0){
             this.secondStepSuccessMessage = "No schemas are included in this database!";
             return;
          }

          this.secondStepSuccessMessage = "";
          this.handleGetSchemasResponse(data);

          if (!this.schemas.some(s => s.schemaName == this.selectedSchema.schemaName)){
            this.secondFormGroup?.get("schemaNameControl")?.setValue("");
          }

          this.stepper.next();
        },
        error: (error) => {
          this.loading = false;
          if (error.error.error === undefined){
            this.firstStepSuccessMessage = "Some error occurred during the loading of schemas!";
            return;
          }

          this.firstStepSuccessMessage = error.error.error;
        }
      });
  }

  /**
   * Handles the click on a schema.
   * @param schema The schema of a database.
   */
  public handleSchemaClick(schema: Schema): void{
    this.secondFormGroup?.get("schemaNameControl")?.setValue(schema.schemaName);
    this.selectedSchema = schema;
  }

  /**
   * Handles the database object type selection change.
   * @param event The radio button selection change event.
   */
  public handleDbObjectTypeSelectionChange(event: any): void{
    this.fourthFormGroup.get("dbObjectControl")?.setValue('');
  }

  /**
   * Handles the database object click.
   * @param dbObject The database object.
   */
  public handleDbObjectClick(dbObject: DbObject): void{
    this.fourthFormGroup?.get("dbObjectControl")?.setValue(dbObject.dbObjectName);
    this.selectedDbObject = dbObject;
  }

  /**
   * Handles the click on the 'Next' button in the database object type selection step.
   * @returns Leaves the method.
   */
  public handleSelectDbObjectTypeNextButtonClick(): void{
    this.thirdFormGroup.markAllAsTouched();
    this.thirdStepSuccessMessage = "";
    if (this.thirdFormGroup.invalid){
      this.thirdStepSuccessMessage = "No database object type was selected!";
      return;
    }

   this.loading = true;
   this.selectedObjectType = this.thirdFormGroup?.get("dbObjectTypeControl")?.value;
   this.loadDbObjects(this.selectedSchema, httpsConfigGeneratorBackendConfig.conn, this.selectedObjectType, this._connString).subscribe({
    next: (data) => {
      this.loading = false;
      this.thirdStepSuccessMessage = "";
      this.handleGetDbObjectsResponse(data);

      if (!this.dbObjects.some(s => s.dbObjectName == this.selectedDbObject.dbObjectName)){
        this.fourthFormGroup?.get("dbObjectControl")?.setValue("");
      }

      this.stepper.next();
    },
    error: (error) => {
      this.loading = false;
      if (error.error.error === undefined){
        this.thirdStepSuccessMessage = "Some error occurred during the loading of the database objects!";
        return;
      }

      this.thirdStepSuccessMessage = error.error.error;
    }
  }
  );
  }

  /**
   * Handles the click on the 'Next' button in the database object selection step.
   * @returns Leaves the method.
   */
  public handleSelectObjectNextButtonClick(): void{
    this.fourthFormGroup.markAllAsTouched();
    this.fourthStepSuccessMessage = "";
    if (this.fourthFormGroup.invalid){
      this.fourthStepSuccessMessage = "No database object was selected!";
      return;
    }

    if (!(this.dbObjects.length > 0)){
      return;
    }

    this.loading = true;
    var reqBody = {"conn": this._connString, "schema": this.selectedSchema.schemaName, "dbObjectType": this.selectedObjectType, "dbObjectName": this.selectedDbObject.dbObjectName};
    this._httpClient.post<GetObjectInformationResponse>(`${httpsSchemaParserBackendConfig.conn}/get-db-object-information`, reqBody).subscribe({
      next: (data) => {
        this.loading = false;
        this.fourthStepSuccessMessage = "";
        this._objectData = data.result[0];
        this.stepper.next();
      },
      error: (error) => {
        this.loading = false;
        if (error.error.error === undefined){
          this.fourthStepSuccessMessage = "Some error occurred during the fetching of database object information!";
          return;
        }

        this.fourthStepSuccessMessage = error.error.error;
      }
  });
  }

  /**
   * Handles the click on the 'Next' button in the schema selection step.
   * @returns Leaves the method.
   */
  public handleSelectSchemaNextButtonClick(): void{
    this.secondFormGroup.markAllAsTouched();
    this.secondStepSuccessMessage = "";
    if (this.secondFormGroup.invalid){
      this.secondStepSuccessMessage = "No schema was selected!";
      return;
    }

    if (!(this.schemas.length > 0)){
      return;
    }

    this.stepper.next();
  }

  /**
   * Handles the click on the 'Next' button in the REST-API name input step.
   * @returns Leaves the method.
   */
  public handleEnterRestApiNameNextButtonClick(): void{
    this.fifthFormGroup.markAllAsTouched();
    this.fifthStepSuccessMessage = "";
    if (this.fifthFormGroup.invalid){
      this.fifthStepSuccessMessage = "No REST-API name was entered!";
      return;
    }

    this.loading = true;
    this._restApiName = this.fifthFormGroup?.get("restApiNameControl")?.value;
    this.getConfiguration(this._objectData, httpsConfigGeneratorBackendConfig.conn, this._connString, this._restApiName).subscribe({
      next: (data) => {
        this.loading = false;
        this._jsonConfig = data;
        this.sixthFormGroup.get("configurationControl")?.setValue(JSON.stringify(this._jsonConfig));
        this.sixthStepSuccessMessage = "";
        this.stepper.next();
      },
      error: (error) => {
        this.loading = false;
        if (error.error.error === undefined){
          this.fifthStepSuccessMessage = "Some error occurred during the fetching of the JSON configuration!";
          return;
        }

        this.fifthStepSuccessMessage = error.error.error;
      }
    })
  }

  /**
   * Handles the schemas refresh button click.
   */
  public handleSchemasRefreshButtonClick(): void{
    this.loading = true;
    this.loadSchemas(httpsSchemaParserBackendConfig.conn).subscribe({
      next: (data) => {
        this.loading = false;
        this.secondStepSuccessMessage = "";
        if (data.result.length == 0){
           this.secondStepSuccessMessage = "No schemas are included in this database!";
           return;
        }

        this.handleGetSchemasResponse(data);

        if (!this.schemas.some(s => s.schemaName == this.selectedSchema.schemaName)){
          this.secondFormGroup?.get("schemaNameControl")?.setValue("");
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.error.error === undefined){
          this.secondStepSuccessMessage = "Some error occurred during the loading of schemas!";
          return;
        }

        this.secondStepSuccessMessage = error.error.error;
      }
    });
  }

  /**
   * Handles the database objects refresh button click.
   */
  public handleDbObjectsRefreshButtonClick(): void{
    this.loading = true;
    this.loadDbObjects(this.selectedSchema, httpsSchemaParserBackendConfig.conn, this.selectedObjectType, this._connString).subscribe({
      next: (data) => {
        this.loading = false;
        this.fourthStepSuccessMessage = "";
        this.handleGetDbObjectsResponse(data);

        if (!this.dbObjects.some(s => s.dbObjectName == this.selectedDbObject.dbObjectName)){
          this.fourthFormGroup?.get("dbObjectControl")?.setValue("");
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.error.error === undefined){
          this.fourthStepSuccessMessage = "Some error occurred during the loading of the database objects!";
          return;
        }

        this.fourthStepSuccessMessage = error.error.error;
      }
    }
    );
  }

  /**
   * Handles the import to Node-RED button click.
   */
  public handleImportToNodeRedButtonClick(): void{
    this.sixthStepSuccessMessage = "";
    const dialogRef = this._dialog.open(NodeRedInstanceDataDialogComponent, {
      disableClose: true,
      width: "25%"
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.result === undefined) {
        return;
      }

      var restApiName = this._restApiName;
      var nodeRedUrl = result.result;
      var nodesWithoutTab = this._jsonConfig.filter(o => o.type !== "tab");
      this.loading = true;
      this.importFlow(restApiName, nodeRedUrl + "flow", nodesWithoutTab).subscribe({
        next: (data) => {
          this.loading = false;
          this.sixthStepSuccessMessage = `The flow was imported with the ID ${data.id}! Please check your Node-RED instance at ${nodeRedUrl}!`;
        },
        error: (error) => {
          this.loading = false;
          if (error.error.error === undefined){
            this.sixthStepSuccessMessage = "Some error occurred during the import of the flow!";
            return;
          }

          this.sixthStepSuccessMessage = error.error.error;
        }
      });
    });
  }

  /**
   * Handles the selection change of the database provider.
   * @param event The selection change event.
   */
  public handleDbProviderSelectionChange(event: MatSelectChange): void{
    var value = event.value;

    switch (value){
      case "mssql":
        this.setDefaultMssqlSettings();
        break;
      case "postgres":
        this.setDefaultPostgresSettings();
        break;
    }
  }

  /**
   * Loads the schemas.
   * @returns The HTTP response observable.
   */
  private loadSchemas(backendUrl: string): Observable<GetSchemasResponse>{
    var reqBody = {"conn": this._connString};
    return this._httpClient.post<GetSchemasResponse>(`${backendUrl}/get-schemas`, reqBody).pipe(
      map(response => {
        return response;
      }));
  }

  /**
   * Loads the database objects.
   * @param schema The schema.
   * @param dbObjectType The database object type (table, view, function or strp).
   * @param connString The connection string.
   * @returns The HTTP response observable.
   */
  private loadDbObjects(schema: Schema, backendUrl: string, dbObjectType: string, connString: string): Observable<GetSchemaEnumsResponse>{
      var schemaName = schema.schemaName;
      var dbObjectType = dbObjectType;
      var reqBody = {"conn": connString, "schema": schemaName, "dbObjectType": dbObjectType};
      return this._httpClient.post<GetSchemaEnumsResponse>(`${backendUrl}/get-schema-enums`, reqBody).pipe(
      map(response => {
        return response;
      }));
  }

  /**
   * Handles the reponse from the HTTP request the gets the database schemas.
   * @param response The HTTP response.
   */
  private handleGetSchemasResponse(response: GetSchemasResponse): void{
    this.schemas.splice(0);
    response.result.forEach(s => this.schemas.push(s));
    this.schemas = this.schemas.sort((a, b) => {
      if (a.schemaName < b.schemaName) {
        return -1;
      }
      if (a.schemaName >= b.schemaName) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * Handles the reponse from the HTTP request the gets the schema enumerations.
   * @param response The HTTP response.
   */
  private handleGetDbObjectsResponse(response: GetSchemaEnumsResponse): void{
    this.dbObjects.splice(0);
    response.result.forEach(t => this.dbObjects.push(t));
    this.dbObjects = this.dbObjects.sort((a, b) => {
      if (a.dbObjectName < b.dbObjectName) {
        return -1;
      }
      if (a.dbObjectName >= b.dbObjectName) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * Gets the configuration of the flow based on the parameters.
   * @param objectData The database object data.
   * @param connString The connection string.
   * @param restApiName The name of the REST-API.
   * @returns The observable of the JSON configuration of the flow.
   */
  private getConfiguration(objectData: any, backendUrl: string, connString: string, restApiName: string): Observable<any>{
    var reqBody = {"conn": connString, "schema": this.selectedSchema.schemaName, "dbObjectType": this.selectedObjectType, "provider": this._dbProvider, "apiName": restApiName, "dbObjectInformation": objectData};
    return this._httpClient.post<any>(`${backendUrl}/get-rest-config`, reqBody).pipe(
      map(response => {
        return response;
      }));
  }

  /**
   * Imports the flow to Node-RED.
   * @param restApiName The name of the REST-API.
   * @param nodeRedUrl The URL address of Node-RED.
   * @param nodesToImport The nodes to import (JSON configuration).
   * @returns The HTTP response observable.
   */
  private importFlow(restApiName: string, nodeRedUrl: string, nodesToImport: any): Observable<ImportFlowResponse>{
    var reqBody = {"label": restApiName, "nodes": nodesToImport};
    return this._httpClient.post<ImportFlowResponse>(nodeRedUrl, reqBody).pipe(
      map(response => {
        return response;
      }));
  }

    /**
   * Sets default settings for the MSSQL server.
   */
    private setDefaultMssqlSettings(): void{
      this.firstFormGroup?.get("userControl")?.setValue(this._mssqlDefaultUser);
      this.firstFormGroup?.get("portControl")?.setValue(this._mssqlDefaultPort);
    }

  /**
   * Sets default settings for the PostgreSQL server.
   */
  private setDefaultPostgresSettings() : void{
    this.firstFormGroup?.get("userControl")?.setValue(this._postgresDefaultUser);
    this.firstFormGroup?.get("portControl")?.setValue(this._postgresDefaultPort);
  }
}
