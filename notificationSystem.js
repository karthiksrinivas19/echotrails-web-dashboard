// Notification System

// Function to calculate the distance between two coordinates using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Function to check conditions and notify the user
function checkAndNotify() {
    const audioData = localStorage.getItem('audioData');

    if (!audioData) {
        console.warn('Required data not found in localStorage.');
        return;
    }

    let parsedData;
    try {
        parsedData = JSON.parse(audioData);
    } catch (error) {
        console.error('Error parsing audioData from localStorage:', error);
        return;
    }

    const { hiddenUntil, latitude, longitude, range } = parsedData;

    if (!hiddenUntil || !latitude || !longitude || !range) {
        console.error('Invalid or incomplete data in audioData:', parsedData);
        return;
    }

    const currentTime = Date.now();

    // Check if the current time has surpassed the hiddenUntil time
    if (currentTime > parseInt(hiddenUntil, 10)) {
        // Get the user's current location
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            // Calculate the distance between the user and the stored location
            const distance = calculateDistance(userLat, userLon, latitude, longitude);

            if (distance <= range) {
                alert('You have surpassed the hidden time and are within the range of nearby audio!');
            }
        }, (error) => {
            console.error('Error getting user location:', error);
        });
    }
}

// Example usage: Call this function immediately when the page loads
if (window.location.pathname === '/map/page.js') {
    checkAndNotify();
}

// Example usage: Call this function periodically or on specific events
setInterval(checkAndNotify, 5000); // Check every 5 seconds

export default checkAndNotify;