import { HeadSizerService } from './services/head-sizer/head-sizer.service';
import { HostListener } from '@angular/core';

export abstract class AHeaderSizedComponent {
	public constructor( protected headSizer: HeadSizerService ){}

	public get headerHeight(){
		return this.headSizer.headerHeight;
	}
}
