export const CDN_ASSETS = {
    banner1:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/Banner_image_1.png?v=1779973773",
    banner2:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/Banner_image_2.png?v=1779973770",
    bottomBanner:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/bottom_banner.png?v=1779973770",
    img36:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/img36.jpg?v=1779973752",
    img88:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/img88.jpg?v=1779973754",
    img109:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/img109.jpg?v=1779973746",
    facebook:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/facebook.png?v=1779973745",
    cart:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/cart.png?v=1779973745",
    logo:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/logo.png?v=1779973743",
    tracking:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/tracking.png?v=1779973743",
    user:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/user.png?v=1779973743",
    support:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/support.png?v=1779973743",
    money:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/money.png?v=1779973743",
    heart:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/heart.png?v=1779973743",
    instagram:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/instagram.png?v=1779973742",
    heartEnabled:
        "https://cdn.shopify.com/s/files/1/0730/5881/2077/files/heartEnabled.png?v=1779973742",
};

const appendParam = (url, key, value) => {
    if (value === undefined || value === null || value === "") return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${key}=${value}`;
};

export const buildCdnUrl = (url, options = {}) => {
    let next = url;
    if (options.width) {
        next = appendParam(next, "width", options.width);
    }
    if (options.format) {
        next = appendParam(next, "format", options.format);
    }
    return next;
};

export const buildCdnSrcSet = (url, widths, format) =>
    widths
        .map((width) => `${buildCdnUrl(url, { width, format })} ${width}w`)
        .join(", ");
