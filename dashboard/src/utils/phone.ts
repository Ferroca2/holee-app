export function stringToPhone(phone: string): string {
    const match = phone.match(/^(\d{2})(\d{4}|\d{5})(\d{4})$/);

    if (!match) {
        console.log('no match');
        return '';
    }

    return `(${ match[1] }) ${ match[2] }-${ match[3] }`;
}

export function phoneToString(phone: string): string {
    const newPhone = phone.replace(/\D/g, '');

    return `55${ newPhone }`;
}
