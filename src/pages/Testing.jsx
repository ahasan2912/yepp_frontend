import React from 'react';
const testingData = [
    {
        city: "Detroit gqasdgasgasadgda",
        state: "Al",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-88.17003679999999, 34.0281608],
        },
        label: "Detroit, Al",
    },
    {
        city: " asgs asdg Detroit Beach asgaga gasdasg asgasdgas asg asgdasa gads",
        state: "Mi",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-83.3286557, 41.93424230000001],
        },
        label: "Detroit Beach, Mi",
    },
    {
        city: "Detroit Lakes",
        state: "Mn",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-95.8453253, 46.8171808],
        },
        label: "Detroit Lakes, Mn",
    },
    {
        city: "Baudette",
        state: "Mn",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-94.59992989999999, 48.7124736],
        },
        label: "Baudette, Mn",
    },
    {
        city: "Burdett",
        state: "Ny",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-76.84884629999999, 42.4200726],
        },
        label: "Burdett, Ny",
    },
    {
        city: "Burdette",
        state: "Ar",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-89.9391376, 35.8176557],
        },
        label: "Burdette, Ar",
    },
    {
        city: "Grand Detour",
        state: "Il",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-89.4117704, 41.896698],
        },
        label: "Grand Detour, Il",
    },
    {
        city: "Hydetown",
        state: "Pa",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-79.72699720000001, 41.6525587],
        },
        label: "Hydetown, Pa",
    },
    {
        city: "Vidette",
        state: "Ga",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-82.2473452, 33.0376503],
        },
        label: "Vidette, Ga",
    },
    {
        city: "Southfield",
        state: "Mi",
        country: "United States",
        location: {
            type: "Point",
            coordinates: [-83.2018954, 42.4623526],
        },
        label: "Southfield, Mi",
    },
];
const Testing = () => {
    const city = "DETROIT";
    const state = "MI";

    const first = testingData.find(
        item =>
            item.city.toLowerCase().includes(city.toLowerCase()) &&
            item.state.toLowerCase() === state.toLowerCase()
    );
    console.log(first);
    return (
        <div>

        </div>
    );
};

export default Testing;