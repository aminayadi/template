/* tslint:disable: ordered-imports*/
import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { ChartsModule } from '@modules/charts/charts.module';
import { TablesModule } from '@modules/tables/tables.module';

/* Components */
import * as dashboardComponents from './components';

/* Containers */
import * as dashboardContainers from './containers';

/* Guards */
import * as dashboardGuards from './guards';

/* Services */
import * as dashboardServices from './services';

import { User } from './user';
import { AuthService } from './auth.service';
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        ChartsModule,
        TablesModule,
    ],
    providers: [...dashboardServices.services, ...dashboardGuards.guards],
    declarations: [...dashboardContainers.containers, ...dashboardComponents.components],
    exports: [...dashboardContainers.containers, ...dashboardComponents.components],
})
export class DashboardModule

implements OnInit {
    // Is a user logged in?
    get authenticated(): boolean {
      return this.authService.authenticated;
    }
    // The user
    get user(): User {
      return this.authService.user;
    }

    constructor(private authService: AuthService) { }

    ngOnInit() {}

    // <signInSnippet>
    async signIn(): Promise<void> {
      await this.authService.signIn();
    }
    // </signInSnippet>
  }


