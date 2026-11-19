export function withBearer(token) {
    return {headers: { Authorization: `Bearer ${token}` } };
}

// To prevent axios converting strings to JSON
export function withRawBody() {
    return { transformRequest: [keepBodyAsIs] };
}

function keepBodyAsIs(body) {
    return body;
}
