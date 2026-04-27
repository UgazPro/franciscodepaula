
export interface AuthLoginData {
    email: string;
    password: string;
}

export interface DecodedToken {
    name: string;
    lastName: string;
    rol: {
        rol: string;
    };
}






