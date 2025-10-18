import {  Component } from '@angular/core';

import {RouterLink, RouterLinkActive } from '@angular/router';

interface MenuOption {
  label: string;
  sublabel: string;
  route: string;
  icon: string;
}


@Component({
  selector: 'gifs-side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-options.component.html',

})
export class SideMenuOptionsComponent {

  menuOption:MenuOption[] =[
    {
      icon: 'fa-solid fa-char-line',
      label: 'Usuario',
      sublabel: '',
      route: '/dashboard/usuario',

    },

    {
      icon: 'fa-solid fa-char-line',
      label: 'Administración de usuarios',
      sublabel: '',
      route: '/dashboard/usuario-admin',

    },


      {
      icon: 'fa-solid fa-char-line',
      label: 'Notificaciones',
      sublabel: '',
      route: '/dashboard/notificacion',

    },

    {
      icon: 'fa-solid fa-char-line',
      label: 'Notificaciones Registro',
      sublabel: '',
      route: '/dashboard/notificacion-registro',

    },

    {
      icon: 'fa-solid fa-gavel',
      label: 'Juzgados',
      sublabel: 'Gestión de Juzgados',
      route: '/dashboard/juzgados',

    },

    {
      icon: 'fa-solid fa-user-tag',
      label: 'Perfiles',
      sublabel: 'Gestión de Perfiles',
      route: '/dashboard/perfiles',

    },


  ] ;


}
