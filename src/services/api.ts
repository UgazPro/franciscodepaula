import { useAuthStore } from "@/stores/auth.store";
import { queryClient } from "@/lib/query-client";
import axios from "axios";

export const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export const getDataApi = async (url: string) => {
    try {
        return await api.get(url).then((res) => {
            return res.data;
        });
    } catch (error) {
        console.log(error);
    }
};

export const getImagesApi = async (url: string) => {
    try {
        return await api.get(url).then((res) => {
            return res.data;
        });
    } catch (error) {
        console.log(error);
    }
};

function unwrapResponse(responseData: unknown) {
    if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && 'success' in responseData && 'data' in responseData && (responseData as Record<string, unknown>).data !== null) {
        if (!(responseData as Record<string, unknown>).success) return responseData;
        return (responseData as Record<string, unknown>).data;
    }
    return responseData;
}

export const postDataApi = async (url: string, data: Record<string, unknown>) => {
    const res = await api.post(url, data);
    return unwrapResponse(res.data);
};

export const putDataApi = async (endpoint: string, data: Record<string, unknown>) => {
    return await api.put(endpoint, data).then((response) => {
        return unwrapResponse(response.data);
    }).catch((err) => {
        return err.response.data;
    })
}

export const deleteDataApi = async (endpoint: string, data: number) => {
    return await api.delete(`${endpoint}/${data}`).then((response) => {
        return unwrapResponse(response.data);
    }).catch((err) => {
        return err.response.data;
    })
}

export const postDataImageApi = async (url: string, data: Record<string, unknown>, img?: File | null,) => {
    try {
        const formData = new FormData();

        if (img) {
            formData.append("profileImg", img);
        }

        Object.entries(data).forEach(([key, value]) => {

            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
                return;
            }


            if (value instanceof Date) {
                formData.append(key, value.toISOString());
                return;
            }

            if (typeof value === "number") {
                formData.append(key, value.toString());
                return;
            }

            if (value === null || value === undefined) {
                return;
            }

            formData.append(key, value as string);
        });

        return await api.post(url, formData).then((res) => unwrapResponse(res.data));
    } catch (error) {
        console.error("postDataImageApi error:", error);
        throw error;
    }
};

export const putDataImageApi = async (url: string, data: Record<string, unknown>, img?: File | null,) => {
    try {
        const formData = new FormData();

        if (img) {
            formData.append("profileImg", img);
        }

        Object.entries(data).forEach(([key, value]) => {

            if (key === "id") return;

            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
                return;
            }


            if (value instanceof Date) {
                formData.append(key, value.toISOString());
                return;
            }

            if (typeof value === "number") {
                formData.append(key, value.toString());
                return;
            }

            if (value === null || value === undefined) {
                return;
            }

            formData.append(key, value as string);
        });

        return await api.put(url, formData).then((res) => unwrapResponse(res.data));
    } catch (error) {
        console.error("postDataImageApi error:", error);
        throw error;
    }
};

// Interceptors
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            queryClient.clear();
            useAuthStore.getState().logout();
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

