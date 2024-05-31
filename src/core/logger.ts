export class Logger {
    constructor(public readonly moduleName: string) {

    }

    log(message: any, ...params: any[]) {
        console.log(`[${this.moduleName}]`, message, ...params);
    }
}