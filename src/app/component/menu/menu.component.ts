import {Component, OnInit} from '@angular/core';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  public menu:any;

  constructor() {
  }

  ngOnInit() {
    this.menu = StateMENU
  }

}

export const StateMENU = [
  {
      name: 'Dashboard',
      path: ['/']
  },
  {
      name: 'Evaluator District Allocation',
      path: ['/evaluator']
  },
  {
      name: 'Evaluator School Allocation',
      path: ['/evaluator-allocation']
  },
  {
      name: 'Evaluator School Allocation',
      children: [
        {
          name: 'sub'
        }
      ]
  }
];
