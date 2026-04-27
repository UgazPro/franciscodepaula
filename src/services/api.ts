import { useAuthStore } from "@/stores/auth.store";
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

export const postDataApi = async (url: string, data: any) => {
    try {
        return await api.post(url, data).then((res) => {
            return res.data;
        });
    } catch (error) {
        console.log(error);
    }
};

export const putDataApi = async (endpoint: string, data: any) => {
    return await api.put(endpoint, data).then((response) => {
        return response.data;
    }).catch((err) => {
        return err.response.data;
    })
}

export const deleteDataApi = async (endpoint: string, data: number) => {
    return await api.delete(`${endpoint}/${data}`).then((response) => {
        return response.data;
    }).catch((err) => {
        return err.response.data;
    })
}

export const postDataImageApi = async (url: string, data: any, img?: File | null,) => {
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

        return await api.post(url, formData).then((res) => res.data);
    } catch (error) {
        console.error("postDataImageApi error:", error);
        throw error;
    }
};

export const putDataImageApi = async (url: string, data: any, img?: File | null,) => {
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

        return await api.put(url, formData).then((res) => res.data);
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
            useAuthStore.getState().logout();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

