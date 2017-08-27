export const config = {

    title: {
        separator: ' | ',
        shortName: 'Tanks-Lab',
        urlName: 'Tanks-Lab.com'
    },
    genTitle: () => {

        return config.title.separator + config.title.urlName;
    }
};
