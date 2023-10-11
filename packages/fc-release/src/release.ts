import {lodash as _, Logger} from "@serverless-cd/core";
import fs from "fs";
import {spawnSync} from 'child_process';
import path from "path";
import * as process from "process";

export interface IProps {
    serviceName: string;
    functionName: string;
    aliasName: string;
    regionId: string;
    access: string;
    debugMode: boolean;
}


export default class FcRelease {
    static readonly fcBashScriptPath = path.resolve(__dirname, "../script/fc-release.sh");
    static readonly fc3BashScriptPath = path.resolve(__dirname, "../script/fc3-release.sh");

    private readonly serviceName: string;
    private readonly functionName: string;
    private readonly aliasName: string;
    private readonly regionId: string;
    private readonly access: string;
    private readonly debug: boolean;

    private logger: Logger;


    constructor(props: IProps, logger: Logger) {
        this.logger = (logger || console) as Logger;
        this.serviceName = props.serviceName
        this.functionName = props.functionName
        this.aliasName = props.aliasName
        this.regionId = props.regionId
        this.access = props.access
        this.debug = false
    }

    run(): { error?: Error } {
        let bashFilePath = ""
        if (_.isEmpty(this.functionName)){
            // fc
            bashFilePath = FcRelease.fcBashScriptPath
        } else {
            // fc3
            bashFilePath = FcRelease.fc3BashScriptPath
        }
        const bashFile = fs.readFileSync(bashFilePath, 'utf-8')
        let args = ['-c', bashFile]
        if (this.debug) {
            args = ['-cx', bashFile]
        }
        const {
            stdout,
            stderr,
            status
        } = spawnSync(`bash`, args, {
            env: {
                ...process.env, ...{
                    region_id: this.regionId,
                    alias_name: this.aliasName,
                    service_name: this.serviceName,
                    function_name: this.functionName,
                    access: this.access,
                }
            }
        })
        const outInfo = stdout.toString('utf-8')
        const errInfo = stderr.toString('utf-8')
        this.logger.info(outInfo)
        this.logger.error(errInfo)
        if (status != 0) {
            this.logger.error("failed to execute fc-release")
            return {error: Error(`failed to execute fc-release, ${errInfo}`)}
        }
        return {}
    }


}