import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from './api';
import { ToastMessage } from '@/components/toast/ToastMessage';

const MUTATION_METHODS = new Set(['post', 'put', 'delete']);
let interceptorId: number | null = null;

export const useAxiosInterceptor = () => {
    const isValidMessage = (msg: any) => {
        return typeof msg === 'string' && msg.trim().length > 2;
    };

    const isMutationMethod = (method?: string) => {
        if (!method) return false;
        return MUTATION_METHODS.has(method.toLowerCase());
    };

    const buildToastId = (method?: string, url?: string, message?: string) => {
        return `${method || 'request'}-${url || 'endpoint'}-${message || 'message'}`;
    };

    useEffect(() => {
        if (interceptorId !== null) {
            api.interceptors.response.eject(interceptorId);
            interceptorId = null;
        }

        interceptorId = api.interceptors.response.use(
            (response) => {
                if (isMutationMethod(response.config.method)) {
                    const message = response.data;
                    if (isValidMessage(message.message)) {
                        toast.custom((t) => (
                            <ToastMessage success={message.success} message={message.message} visible={t.visible} />
                        ), {
                            id: buildToastId(response.config.method, response.config.url, message.message),
                            duration: 3000,
                            position: 'top-right'
                        });
                    }
                }
                return response;
            },
            (error) => {
                if (isMutationMethod(error.config?.method)) {
                    const message = error.response?.data;

                    if (isValidMessage(message?.message)) {
                        toast.custom((t) => (
                            <ToastMessage success={message.success} message={message.message} visible={t.visible} />
                        ), {
                            id: buildToastId(error.config?.method, error.config?.url, message.message),
                            duration: 3000,
                            position: 'top-right'
                        });
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            if (interceptorId !== null) {
                api.interceptors.response.eject(interceptorId);
                interceptorId = null;
            }
        };
    }, []);

    return null;
}
