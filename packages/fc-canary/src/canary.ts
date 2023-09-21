import {Logger} from "@serverless-cd/core";
import fs from "fs";
import {spawnSync} from 'child_process';
import path from "path";

export interface IProps {
    serviceName: string;
    aliasName: string;
    regionId: string;
    canaryPercent: number;
    access: string;
    debugMode: boolean;
}


export default class FcCanary {
    static readonly bashScriptPath = path.resolve(__dirname, "../script/fc-canary.sh");

    private readonly serviceName: string;
    private readonly aliasName: string;
    private readonly regionId: string;
    private readonly canaryPercent: number;
    private readonly access: string;
    private readonly debug: boolean;

    private logger: Logger;


    constructor(props: IProps, logger: Logger) {
        this.logger = (logger || console) as Logger;
        this.serviceName = props.serviceName
        this.aliasName = props.aliasName
        this.regionId = props.regionId
        this.canaryPercent = props.canaryPercent
        this.access = props.access
        this.debug = false
    }

    run(): { error?: Error } {
        const bashFile = fs.readFileSync(FcCanary.bashScriptPath, 'utf-8')
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
                    canary_percent: this.canaryPercent.toString(),
                    access: this.access,
                }
            }
        })
        const outInfo = stdout.toString('utf-8')
        const errInfo = stderr.toString('utf-8')
        this.logger.info(outInfo)
        this.logger.error(errInfo)
        if (status != 0) {
            this.logger.error("failed to execute fc-canary")
            return {error: Error(`failed to execute fc-canary, ${errInfo}`)}
        }
        return {}
    }


}