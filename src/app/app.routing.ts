import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginUserComponent } from './views/login-user/login-user.component';
import { UserServicesComponent } from './views/user-services/user-services.component';
import { UserSalesComponent } from './views/user-sales/user-sales.component';
import { UserSupportComponent } from './views/user-support/user-support.component';
import { UserEmployeeRegisterComponent } from './views/user-employee-register/user-employee-register.component';
import { UserCompanyRegisterComponent } from './views/user-company-register/user-company-register.component';
import { UserHomeComponent } from './views/user-panel/user-home/user-home.component';
import { UserForgotPasswordComponent } from './views/user-forgot-password/user-forgot-password.component';
import { PinComponent } from './views/pin/pin.component';
import { PreferenceMenuComponent } from './shared/components/preference-menu/preference-menu.component';
import { ExternalLoginComponent } from './views/external-login/external-login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'user-login',
    pathMatch: 'full',
  },

  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'user-login',
    component: LoginUserComponent,
    data: {
      title: 'User Login Page'
    }
  },
  {
    path: 'forgot-password',
    component: UserForgotPasswordComponent,
    data:
    {
      title: 'User Forgot Password'
    }
  },
  {
    path: 'register',
    component: UserCompanyRegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'services',
    component: UserServicesComponent,
    data: {
      title: 'Services Page'
    }
  },
  {
    path: 'sales',
    component: UserSalesComponent,
    data: {
      title: 'Sales Page'
    }
  },
  {
    path: 'support',
    component: UserSupportComponent,
    data: {
      title: 'Support Page'
    }
  },
  {
    path: 'register-employee',
    component: UserEmployeeRegisterComponent,
    data: {
      title: 'Employee Register Page'
    }
  },
  {
    path: 'register-company',
    component: UserCompanyRegisterComponent,
    data: {
      title: 'Employee Company Page'
    }
  },
  {
    path: 'pin-login',
    component: PinComponent,
    data: {
      title: 'pin login page'
    }
  },
  {
    path: 'external-login',
    component: ExternalLoginComponent,
    data: {
      title: 'external Login page'
    }
  },

  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'home',
        component: UserHomeComponent,
        data: {
          title: 'Home'
        }
      },
      {
        path: 'submodule',
        loadChildren: './views/user-panel/sub-module/submodule.module#SubModuleModule'
      },
      {
        path: 'workflow',
        loadChildren: './views/user-panel/workflow/workflow.module#WorkflowModule'
      },
      {
        path: 'connections',
        loadChildren: './views/user-panel/connections/connections.module#ConnectionsModule'
      },
      {
        path: 'documents',
        loadChildren: './views/user-panel/documents/document.module#DocumentModule'
      },
      {
        path: 'strategy',
        loadChildren: './views/user-panel/strategy/strategy.module#StrategyModule'
      },
      {
        path: 'assessment',
        loadChildren: './views/user-panel/assessment/assessment.module#AssessmentModule'
      },
      {
        path: 'performance',
        loadChildren: './views/user-panel/performance/performance.module#PerformanceModule'
      },
      {
        path: 'collaboration',
        loadChildren: './views/user-panel/collaboration/collaboration.module#CollaborationModule'
      },

      {
        path: 'details',
        loadChildren: './views/user-panel/details/details.module#DetailsModule'
      },
      {
        path: 'search',
        loadChildren: './views/user-panel/overallsearch/overallsearch.module#OverallSearchModule'
      },
      {
        path: 'preference',
        component: PreferenceMenuComponent,
        data: {
          title: 'preference'
        }
      },
      {
        path: 'reporting',
        loadChildren: './views/user-panel/reporting/reporting.module#ReportingModule'
      },

    ]
  },
  {
    path: '**',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
