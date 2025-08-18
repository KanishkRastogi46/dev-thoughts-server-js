import { Inject, Injectable } from "@nestjs/common";
import { DrizzleAsyncProvider } from "./drizzle.provider";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from './schema';

@Injectable()
export class DrizzleService {
    constructor(
        @Inject(DrizzleAsyncProvider)
        public readonly db: NodePgDatabase<typeof schema>
    ) {}
}