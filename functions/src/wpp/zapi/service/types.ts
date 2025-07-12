// Messages
export interface MessageInfo {
    zaapId: string,                     // Instance ID
    messageId: string,                  // Message ID
    id: string,                         // Message ID (same as messageId... added for consistency with 'zapier')
}

// Contacts
export interface PhoneExistsResult {
    exists: boolean;                // Whether the phone number exists on WhatsApp
    inputPhone: string;             // The phone number provided in the input
    outputPhone: string;            // The correctly formatted phone number
}
