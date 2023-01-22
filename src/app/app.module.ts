import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MenuComponent } from './component/menu/menu.component';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { ModuleHeaderComponent } from './component/module-header/module-header.component';
import { ParameterComponent } from './pages/master/parameter/parameter.component';

import { HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonListComponent } from './pages/master/common-list/common-list.component';
import { ModuleComponent } from './pages/master/module/module.component';
import { CompanyComponent } from './pages/master/company/company.component';
import { BranchComponent } from './pages/master/branch/branch.component';
import { CityStateCountryComponent } from './pages/master/city-state-country/city-state-country.component';
import { UserComponent } from './pages/master/user/user.component';
import { UserPermissionComponent } from './pages/master/user-permission/user-permission.component';
import { ItemComponent } from './pages/master/item/item.component';
import { CategoryComponent } from './pages/master/category/category.component';
import { BrandComponent } from './pages/master/brand/brand.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { ItemTaxComponent } from './pages/master/item-tax/item-tax.component';
import { CategorySubComponent } from './pages/master/category-sub/category-sub.component';
import { TestComponent } from './pages/master/test/test.component';
import { MenuItemComponent } from './component/menu-item/menu-item.component';
import { CityComponent } from './pages/master/city/city.component';
import { CountryComponent } from './pages/master/country/country.component';
import { StateComponent } from './pages/master/state/state.component';
import { BrandManufracturerComponent } from './pages/master/brand-manufracturer/brand-manufracturer.component';
import { ManufracturerComponent } from './pages/master/manufracturer/manufracturer.component';
import { CategorySubcategoryComponent } from './pages/master/category-subcategory/category-subcategory.component';
import { ItemLevelSchemeComponent } from './pages/master/item-level-scheme/item-level-scheme.component';
import { VendorComponent } from './pages/master/vendor/vendor.component';
import { CustomerComponent } from './pages/master/customer/customer.component';
import { PaymentModeComponent } from './pages/master/payment-mode/payment-mode.component';
import { PaymentIncludeExcludeComponent } from './pages/master/payment-include-exclude/payment-include-exclude.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    MenuComponent,
    HeaderComponent,
    FooterComponent,
    ModuleHeaderComponent,
    ParameterComponent,
    CommonListComponent,
    ModuleComponent,
    CompanyComponent,
    BranchComponent,
    CityStateCountryComponent,
    UserComponent,
    UserPermissionComponent,
    ItemComponent,
    CategoryComponent,
    BrandComponent,
    TaxComponent,
    ItemTaxComponent,
    CategorySubComponent,
    TestComponent,
    MenuItemComponent,
    CityComponent,
    CountryComponent,
    StateComponent,
    BrandManufracturerComponent,
    ManufracturerComponent,
    CategorySubcategoryComponent,
    ItemLevelSchemeComponent,
    VendorComponent,
    CustomerComponent,
    PaymentModeComponent,
    PaymentIncludeExcludeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    HttpClientModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
