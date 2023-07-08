export function recastClass(element: any, targetClass: any) {
    if(element instanceof targetClass) return element;
    if(element instanceof Object) {
        let newElement = new targetClass();
        for(let key in element) {
            newElement[key] = recastClass(element[key], targetClass);
        }
        return newElement;
    }
    if(element instanceof Array) {
        let newArray: any[] = [];
        for(let i = 0; i < element.length; i++) {
            newArray[i] = recastClass(element[i], targetClass);
        }
        return newArray;
    }
    return element;
}