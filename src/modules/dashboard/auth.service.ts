// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Client } from '@microsoft/microsoft-graph-client';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import { AlertsService } from './alerts.service';
import { OAuthSettings } from './oauth';
import { User } from './user';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public authenticated: boolean;
  public user: User;
  public token: string;
  public dName:string;
  //private http: HttpClient;

  private readonly  URL = 'http://localhost:8082/api/atconsulting/service';



 // resolveItems(): Observable<any> {

    ngOnInit() {

      const headers = { 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJST0xFX0FETUlOLFJPTEVfVVNFUiIsImV4cCI6MTYxODMwNjY2Nn0.hokcCGCZGPMXcpTup6gm4hihP7uMVYnyxH8NsoAN5SOWvR1tD9TTXXOhSZB8u1RHkq8OSBnD_b2lkZBefMQOFQ',
                       'Content-Type': 'application/json' };
      const body = { bearer_token: this.token };
      console.log("coucou je suis là : execute post backend ------------------")
      return this.http.post<any>(this.URL, body, { headers }).subscribe(data => {
          this.dName = data;
      });
      console.log("Spring return :"+this.dName);
  }



  /*  console.log('Request is sent! .............................................');
    // Using the POST method
    const headers = {
      headers: new HttpHeaders({
        "Authorization": "Token eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJST0xFX0FETUlOLFJPTEVfVVNFUiIsImV4cCI6MTYxODIxODQwMH0.oa9R9QHQ8ST3XBXVezhM4j5QKbo7iSoOOXhQqgvj0eSUgmI3PbCG22-EnX9lKHQLeKjWoaQJkdh3cn4w7mlhJw"
      })
    };



    const body = {'bearer_token' : this.token };


console.log("coucou je suis là : execute post backend ------------------")

    return this.http.post<any>(this.URL, body, { headers }.headers);
  }*/

  // <constructorSnippet>
  constructor(
    private msalService: MsalService,
    private alertsService: AlertsService,
    private http: HttpClient) {

    this.authenticated = this.msalService.getAccount() != null;
    this.getUser().then((user) => {this.user = user});
  }
  // </constructorSnippet>

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
    let result = await this.msalService.loginPopup(OAuthSettings)
      .catch((reason) => {
        this.alertsService.addError('Login failed', JSON.stringify(reason, null, 2));
      });

    if (result) {
      this.authenticated = true;
      this.user = await this.getUser();
    }
  }

  // Sign out
  signOut(): void {
    this.msalService.logout();
    this.user = null;
    this.authenticated = false;
  }

  // Silently request an access token
  async getAccessToken(): Promise<string> {
    let result = await this.msalService.acquireTokenSilent(OAuthSettings)
      .catch((reason) => {
        this.alertsService.addError('Get token failed', JSON.stringify(reason, null, 2));
      });

    if (result) {
      return result.accessToken;
    }

    // Couldn't get a token
    this.authenticated = false;
    return null;
  }

  // URL which returns list of JSON items (API end-point URL)


  // <getUserSnippet>
  private async getUser(): Promise<User> {
    if (!this.authenticated) return null;

    let graphClient = Client.init({
      // Initialize the Graph client with an auth
      // provider that requests the token from the
      // auth service
      authProvider: async(done) => {
        let token = await this.getAccessToken()
          .catch((reason) => {
            done(reason, null);
          });

        if (token)
        {
          console.log("TOKEN = " + token);
          this.token = token ;
          let results = this.ngOnInit();



          done(null, token);
        } else {
          done("Could not get an access token", null);
        }
      }
    });

    // Get the user from Graph (GET /me)
    let graphUser: MicrosoftGraph.User = await graphClient
      .api('/me')
      .select('displayName,mail,mailboxSettings,userPrincipalName')
      .get();

    let user = new User();
    user.displayName = graphUser.displayName;
    // Prefer the mail property, but fall back to userPrincipalName
    user.email = graphUser.mail || graphUser.userPrincipalName;
    user.timeZone = graphUser.mailboxSettings.timeZone;

    // Use default avatar
    user.avatar = '/assets/no-profile-photo.png';

    return user;
  }
  // </getUserSnippet>
}
