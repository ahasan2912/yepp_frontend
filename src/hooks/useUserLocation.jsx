const useUserLocation = async () => {
    const { latitude, longitude } = JSON.parse(localStorage.getItem("userLocation")) || {};
    return { latitude, longitude }
};

export default useUserLocation;