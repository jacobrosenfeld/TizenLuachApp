// kosher-zmanim-loader.js
// Loads kosher-zmanim from CDN if not already loaded and triggers a global event when ready
(function() {
    if (!window.kosherZmanim) {
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/kosher-zmanim/dist/kosher-zmanim.min.js';
        script.onload = function() {
            console.log('kosher-zmanim loaded from CDN');
            document.dispatchEvent(new Event('kosher-zmanim-loaded'));
        };
        document.head.appendChild(script);
    } else {
        document.dispatchEvent(new Event('kosher-zmanim-loaded'));
    }
})();
