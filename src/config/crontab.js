module.exports = [
    {
        cron: '*/30 * * * *',
        handle: 'api/geo',
        immediate: true
    },
    {
        cron: '*/20 * * * *',
        handle: 'api/top',
        immediate: true
    }
]