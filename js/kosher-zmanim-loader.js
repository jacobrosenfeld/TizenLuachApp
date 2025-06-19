// kosher-zmanim-loader.js
// Loads kosher-zmanim from CDN if not already loaded and triggers a global event when ready
(function() {
    function loadScript(src, onload, onerror) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = onload;
        script.onerror = onerror;
        document.head.appendChild(script);
    }
    if (!window.KosherZmanim) {
        // Try CDN first
        loadScript(
            'https://unpkg.com/kosher-zmanim/dist/kosher-zmanim.min.js',
            function() {
                console.log('kosher-zmanim loaded from CDN');
                document.dispatchEvent(new Event('kosher-zmanim-loaded'));
            },
            function() {
                // Fallback to local copy
                loadScript(
                    'js/kosher-zmanim.min.js',
                    function() {
                        console.log('kosher-zmanim loaded from local fallback');
                        document.dispatchEvent(new Event('kosher-zmanim-loaded'));
                    },
                    function() {
                        console.error('Failed to load kosher-zmanim from both CDN and local fallback');
                        document.dispatchEvent(new Event('kosher-zmanim-load-failed'));
                    }
                );
            }
        );
    } else {
        document.dispatchEvent(new Event('kosher-zmanim-loaded'));
    }
})();
