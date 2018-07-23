import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as _ from 'lodash';

import { Diaspora } from '@diaspora/diaspora';


interface ICodeLineDisplayed {
	code?: string;
	text: string;
	type: ECommandType;
}
interface ICodeLineExecuted {
	code: string;
}
type ICodeLine = ICodeLineDisplayed | ICodeLineExecuted;

enum ECommandType {

}


const isCodeLineExecuted = (item: ICodeLine): item is ICodeLineExecuted => {
	return !_.isNil(item.code)  && _.isNil((item as any).text);
};


@Component({
	selector: 'app-ioarea',
	templateUrl: './ioarea.component.html',
	styleUrls: ['./ioarea.component.scss']
})
export class IOAreaComponent implements OnInit {
	private static context = {};

	private history: {command: string, response: string, errored: boolean}[] = [];

	private liveCodingText: string | null = null;
	private lines: ICodeLine[] = [];
	private resetInstruction: ICodeLineExecuted = {
		code: '',
	};
	private currentLineIndex = 0;
	private playing = true;


	private isCodeLineExecuted = isCodeLineExecuted;

	/**
	 * @see https://stackoverflow.com/questions/8403108/calling-eval-in-particular-context
	 */
	private static evalInContext(js: string) {
		// Return the results of the in-line anonymous function we .call with the passed context
		// tslint:disable-next-line:no-eval
		return (function() { return eval(js); }).call(IOAreaComponent.context);
	}

	private getPointClass(code: ICodeLineDisplayed, index: number) {
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
			this.resetInstruction = cnt.slice(-1);
			this.playLoop();
		});
		(window as any).Diaspora = Diaspora;
	}

	ngOnInit() {
	}

	private async setFrame(frameNumber: number) {
		console.log('set frame', frameNumber);
		const frameDiff = frameNumber - this.currentLineIndex;
		if (frameDiff > 0) {
			for (let i = 0; i < frameDiff; i++) {
				const newCodeLine = this.lines[this.currentLineIndex];
				if (newCodeLine) {
					await this.doAction(newCodeLine as any);
				}
				this.currentLineIndex++;
			}
		} else if (frameDiff < 0) {
			await this.doAction(this.resetInstruction);
			this.currentLineIndex = -1;
			this.history = [];
			await this.setFrame(frameNumber);
		} else if (this.playing) {
			await this.doAction(this.lines[this.currentLineIndex] as any);
		}
		this.playing = false;
		// this.history =
	}

	private eval(command: string) {
		try {
			return {
				error: false,
				return: IOAreaComponent.evalInContext(command),
			};
		} catch (e) {
			return {
				error: true,
				return: e,
			};
		}
	}



	private stringifyOutput(content: any, depth: number = 0): string {
		const stringifySub = (item: any) => {
			return this.stringifyOutput(item, depth + 1).split('\n').map(s => `\t${s}`).join('\n').replace(/^\t/, '');
		};

		if (_.isObject(content)) {
			if (depth > 2) {
				return '<span class="t-o">[object]</span>';
			}
			if (!_.isPlainObject(content)) {
				return `<span class="t-c">${content.constructor.name}</span>(${stringifySub(_.assign({}, content))})`;
			} else {
				const str = _.chain(content)
				.mapValues((value, key) => `<span class="t-k">${key}</span>: ${stringifySub(value)}`)
				.join('\n\t')
				.value();
				return str.length > 0 ? `{${str}\n}` : '{}';
			}
		} else if (_.isUndefined(content)) {
			return '<span class="t-u">undefined</span>';
		} else if (_.isNull(content)) {
			return '<span class="t-n">null</span>';
		} else {
			return JSON.stringify(content);
		}
	}

	private async awaitResolution(promise: Promise<any>) {
		console.log({promise});
		try {
			return {
				output: this.stringifyOutput(await promise),
				errored: false,
			};
		} catch (error) {
			return {
				output: this.stringifyOutput(error),
				errored: false,
			};
		}
	}



	private async doAction(codeLine: ICodeLineDisplayed): Promise<false>;
	private async doAction(codeLine: ICodeLineExecuted): Promise<true>;
	private async doAction(codeLine: ICodeLine) {
		if (isCodeLineExecuted(codeLine)) {
			const result = await this.eval(codeLine.code);
			console.log({codeLine, currentLineIndex: this.currentLineIndex, result, ctx: IOAreaComponent.context});
			return false;
		} else {
			const result = this.eval(codeLine.code || codeLine.text);
			console.log({codeLine, currentLineIndex: this.currentLineIndex, result, ctx: IOAreaComponent.context});
			const resolution = await this.awaitResolution(result.return);
			this.history.push({
				command: codeLine.text,
				response: resolution.output,
				errored: resolution.errored || result.error,
			});
			this.history = this.history.slice(-4);
			return true;
		}
	}

	private async playLoop() {
		while (this.playing) {
			const currentLine = this.lines[this.currentLineIndex];
			if (!currentLine) {
				return;
			}
			if (isCodeLineExecuted(currentLine)) {
				await this.doAction(currentLine);
				this.currentLineIndex++;
			} else {
				await this.writeTextToLive(currentLine.text);
				if (!this.playing) {
					this.liveCodingText = null;
					return;
				}
				await new Promise(resolve => setTimeout(resolve, 500));
				if (!this.playing) {
					this.liveCodingText = null;
					return;
				}

				this.liveCodingText = null;
				await this.doAction(currentLine);
				await new Promise(resolve => setTimeout(resolve, 1000));
				if (!this.playing) {
					return;
				}

				this.currentLineIndex++;
			}
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
				if (i === textLength || !this.playing) {
					clearInterval(loopInterval);
					return resolve(true);
				}
				i++;
				this.liveCodingText = text.substr(0, i);
			}, 50);
		});
	}
}
