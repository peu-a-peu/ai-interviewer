export function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(1), ms)
    })
}
export function capitalize(str: string): string {
    if (!str) return str; // Return the same string if it's empty
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }