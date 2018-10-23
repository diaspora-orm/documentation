import { IRoadmapItem } from './../../../environments/content';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component( {
	selector: 'app-roadmap',
	templateUrl: './roadmap.component.html',
	styleUrls: ['./roadmap.component.scss'],
} )
export class RoadmapComponent implements OnInit {
	public roadmap: IRoadmapItem[] = environment.roadmap;

	public constructor() { }

	public ngOnInit() {
	}

}
