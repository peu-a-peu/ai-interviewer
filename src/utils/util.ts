export function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(1), ms)
    })
}