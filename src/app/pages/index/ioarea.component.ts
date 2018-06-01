import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs/index';


interface ICodeLine {
	text: string;
	code: string;
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
	
	constructor(private http: HttpClient) {
		// Make the HTTP request:
		forkJoin(
			this.http.get('/assets/content/demo.txt', { responseType: 'text'}),
			this.http.get('/assets/content/demo-aliased.txt', { responseType: 'text'}),
		).subscribe(([raw, replaced]: [string, string]) => {
			const rawSplitted = raw.split('\n');
			const replacedSplitted = replaced.split('\n');
			this.lines = [];
			rawSplitted.forEach((line, index) => {
				if (line.trim().length > 0) {
					const code = replacedSplitted.length > index && replacedSplitted[index].trim().length > 0 ?
					replacedSplitted[index].trim() :
					line.trim();
					this.lines.push({
						text: line,
						code,
					});
				}
			});
			this.playLoop();
		});
		// console.log(Diaspora);
		// (window as any).Diaspora = D;
	}
	
	
	private stringifyOutput(content: any) {
		return JSON.stringify(content, null, 4);
	}
	
	ngOnInit() {
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
		while (true) {
			const currentLine = this.lines[this.currentLineIndex];
			if (!currentLine) {
				return;
			}
			console.log(currentLine);
			await this.writeTextToLive(currentLine.text);
			await new Promise(resolve => setTimeout(resolve, 500));
			this.liveCodingText = null;
			const result = this.eval(currentLine.code);
			this.history.push({
				command: currentLine.text,
				response: this.stringifyOutput(result.return),
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
