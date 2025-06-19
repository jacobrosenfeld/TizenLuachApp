// kosher-zmanim-debug.js
(function() {
    setTimeout(function() {
        console.log('window.kosherZmanim:', window.kosherZmanim);
        console.log('window.KosherZmanim:', window.KosherZmanim);
        if (window.kosherZmanim) {
            for (const key in window.kosherZmanim) {
                console.log('kosherZmanim export:', key, typeof window.kosherZmanim[key]);
            }
        }
        if (window.KosherZmanim) {
            for (const key in window.KosherZmanim) {
                console.log('KosherZmanim export:', key, typeof window.KosherZmanim[key]);
            }
        }
    }, 2000);
})();
