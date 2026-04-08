import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { StatsPageComponent } from './pages/stats-page/stats-page.component';
import { VideogamePageComponent } from './pages/videogame-page/videogame-page.component';

export const routes: Routes = [
	{ path: '', component: HomePageComponent },
	{ path: 'login', component: LoginPageComponent },
	{ path: 'signin', component: SignupPageComponent },
	{ path: 'stats', component: StatsPageComponent },
	{ path: 'videogame', component: VideogamePageComponent },
	{ path: '**', redirectTo: '' }
];
