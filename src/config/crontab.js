module.exports = [
    {
        cron: '*/20 * * * *',
        handle: 'api/run',
        immediate: true
    },
    // {
    //     cron: '*/30 * * * *',
    //     handle: 'api/geo',
    //     immediate: true
    // }
]