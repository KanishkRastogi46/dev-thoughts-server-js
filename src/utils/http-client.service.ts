import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

@Injectable()
export class HttpClientService {
    constructor(
        private readonly axiosInstance: AxiosInstance,
        private readonly baseUrl: string,
        private readonly configService: ConfigService
    ) {
        this.axiosInstance = axios.create()
        this.baseUrl = this.configService.get('API_BASE_URL')
    }

    async apiCall<T>(
        serviceName: string,
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        data?: T,
        headers?: Record<string, string>,
    ): Promise<AxiosResponse> {
        try {
            const requestConfig: AxiosRequestConfig = {
                baseURL: this.baseUrl,
                url: endpoint,
                method,
                headers: {
                    ...headers,
                    ...(method === 'GET') && { 'accept': 'application/json' },
                    ...(method !== 'GET') && { 'Content-Type': 'application/json' },
                },
                data,
                withCredentials: true
            }
            const response: AxiosResponse = await this.axiosInstance(requestConfig)
            return response
        } catch (error: any) {
            if (error instanceof AxiosError) {
                throw new Error(error.response?.data?.message || 'API call failed')
            }
            throw new Error('An unexpected error occurred while making the API call')
        }
    }
}