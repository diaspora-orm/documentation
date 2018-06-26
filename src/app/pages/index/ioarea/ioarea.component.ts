import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs/index';

import { Diaspora } from '@diaspora/diaspora';


interface ICodeLine {
	code?: string;
	text: string;
	type: ECommandType;
}

enum ECommandType {

}

@Component({
	selector: 'app-ioarea',
	templateUrl: './ioarea.component.html',
	styleUrls: ['./ioarea.component.scss']
})
export class IOAreaComponent implements OnInit {
	private history: {command: string, response: string, errored: boolean}[] = [];

	private liveCodingText: string | null = null;
	private lines: ICodeLine[] = [];
	private currentLineIndex = 0;
	private playing = true;

	private getPointClass(code: ICodeLine, index: number) {
		return {
			['type-' + code.type]: true,
			active: index === this.currentLineIndex
		};
	}

	constructor(private http: HttpClient) {
		// Make the HTTP request:
		this.http.get('/assets/content/demo.json')
		.subscribe((cnt: any) => {
			this.lines = cnt as ICodeLine[];
			this.playLoop();
		});
		(window as any).Diaspora = Diaspora;
	}


	private async stringifyOutput(content: any): Promise<string> {
		if (content instanceof Promise) {
			const promiseRes = await content;
			return `Promise(${await this.stringifyOutput(promiseRes)})`;
		}
		return JSON.stringify(content, null, 4);
	}

	ngOnInit() {
	}

	private setFrame(frameNumber: number){
		this.playing = false;
		this.history = 
	}

	private eval(command: string) {
		try {
			return {
				error: false,
				return: eval(command),
			};
		} catch (e) {
			return {
				error: true,
				return: e,
			};
		}
	}

	private async playLoop() {
		while (this.playing) {
			const currentLine = this.lines[this.currentLineIndex];
			if (!currentLine) {
				return;
			}
			console.log(currentLine);
			await this.writeTextToLive(currentLine.text);
			await new Promise(resolve => setTimeout(resolve, 500));
			this.liveCodingText = null;
			const result = this.eval(currentLine.code || currentLine.text);
			console.log(result);
			this.history.push({
				command: currentLine.text,
				response: await this.stringifyOutput(result.return),
				errored: result.error,
			});
			this.history = this.history.slice(-4);
			await new Promise(resolve => setTimeout(resolve, 1000));
			this.currentLineIndex++;
			if (this.currentLineIndex === this.lines.length) {
				this.history = [];
				this.currentLineIndex = 0;
			}
		}
	}

	private async writeTextToLive(text: string) {
		this.liveCodingText = null;
		const textLength = text.length;
		let i = 0;
		return new Promise(resolve => {
			const loopInterval = setInterval(() => {
				if (i === textLength) {
					clearInterval(loopInterval);
					return resolve(true);
				}
				i++;
				this.liveCodingText = text.substr(0, i);
			}, 50);
		});
	}
}
