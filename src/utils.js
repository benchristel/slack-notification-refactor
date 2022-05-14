// @flow
export function intoObject<V>(obj: {[string]: V}, [key, value]: [string, V]): {[string]: V} {
    obj[key] = value
    return obj
}

export function entries<V>(obj: {[string]: V}): [[string, V]] {
    return (Object.entries(obj): any)
}
