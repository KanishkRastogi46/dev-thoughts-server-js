import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Client from 'postgres'

export const DrizzleProviderName = 'DrizzleProvider'

export const DrizzleProvider: Provider = {
    provide: DrizzleProviderName,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
        const client = Client(
            {
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                pass: config.get<string>('DB_PASSWORD'),
                db: config.get<string>('DB_NAME'),
            }
        )
    }
}
