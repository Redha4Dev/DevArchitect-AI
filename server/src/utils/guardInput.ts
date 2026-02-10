export const guardInputSize = (
    text: string,
    maxLength = 8000
) => {
    if( text.length > maxLength) {
        return text.slice(0, maxLength) + "\n\n[TRUNCATED]";    
    }
    return text;
}