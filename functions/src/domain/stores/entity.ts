export interface Address {
    city: string;
    complement?: string;
    country?: string;
    lat?: number;
    lng?: number;
    neighborhood: string;
    number: string;
    referencePoint?: string;
    state: string;
    street: string;
    zipcode: string;
}

export interface Store {
    name: string;
    address: Address;
    phone: string;
    email: string;
    links: {
        website?: string;
        instagram?: string;
        linkedin?: string;
    };
    owner: {
        name: string;
        id: string;
    };
    mission: string;
    vision: string;
    values: string[];
    description: string;
    logo: string;
    createdAt: number;
    updatedAt: number;
    isActive: boolean;
    isDeleted: boolean;
}
