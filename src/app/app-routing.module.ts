import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BranchComponent } from './pages/master/branch/branch.component';
import { BrandManufracturerComponent } from './pages/master/brand-manufracturer/brand-manufracturer.component';
import { BrandComponent } from './pages/master/brand/brand.component';
import { CategorySubComponent } from './pages/master/category-sub/category-sub.component';
import { CategorySubcategoryComponent } from './pages/master/category-subcategory/category-subcategory.component';
import { CategoryComponent } from './pages/master/category/category.component';
import { CityStateCountryComponent } from './pages/master/city-state-country/city-state-country.component';
import { CommonListComponent } from './pages/master/common-list/common-list.component';
import { CompanyComponent } from './pages/master/company/company.component';
import { CustomerComponent } from './pages/master/customer/customer.component';
import { ItemLevelSchemeComponent } from './pages/master/item-level-scheme/item-level-scheme.component';
import { ItemTaxComponent } from './pages/master/item-tax/item-tax.component';
import { ItemComponent } from './pages/master/item/item.component';
import { ModuleComponent } from './pages/master/module/module.component';
import { ParameterComponent } from './pages/master/parameter/parameter.component';
import { PaymentIncludeExcludeComponent } from './pages/master/payment-include-exclude/payment-include-exclude.component';
import { PaymentModeComponent } from './pages/master/payment-mode/payment-mode.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { TestComponent } from './pages/master/test/test.component';
import { UserPermissionComponent } from './pages/master/user-permission/user-permission.component';
import { UserComponent } from './pages/master/user/user.component';
import { VendorComponent } from './pages/master/vendor/vendor.component';
import { PointOfSaleComponent } from './pages/sales/point-of-sale/point-of-sale.component';
import { SalesReturnComponent } from './pages/sales/sales-return/sales-return.component';
import { OpningStockComponent } from './pages/transactions/opning-stock/opning-stock.component';
import { PurchaseEntryComponent } from './pages/transactions/purchase-entry/purchase-entry.component';
import { RateAdjustmentComponent } from './pages/transactions/rate-adjustment/rate-adjustment.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'test', component: TestComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'parameter', component: ParameterComponent },
  { path: 'common-list', component: CommonListComponent },
  { path: 'module', component: ModuleComponent },
  { path: 'company', component: CompanyComponent },
  { path: 'user', component: UserComponent },
  { path: 'user-permission', component: UserPermissionComponent },
  { path: 'category-sub-category', component: CategorySubcategoryComponent },
  { path: 'tax', component: TaxComponent },
  { path: 'country-state-city', component: CityStateCountryComponent },
  { path: 'brand-manufracturer', component: BrandManufracturerComponent },
  { path: 'branch', component: BranchComponent },
  { path: 'item-level-scheme', component: ItemLevelSchemeComponent },
  { path: 'vendor', component: VendorComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'payment-mode', component: PaymentModeComponent },
  { path: 'payment-incl-excl', component: PaymentIncludeExcludeComponent },
  { path: 'item-tax', component: ItemTaxComponent },
  { path: 'item', component: ItemComponent },
  { path: 'opening-stock', component: OpningStockComponent },
  { path: 'purchase-entry', component: PurchaseEntryComponent },
  { path: 'point-of-sale', component: PointOfSaleComponent },
  { path: 'sales-return', component: SalesReturnComponent },
  { path: 'rate-adjustment', component: RateAdjustmentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
