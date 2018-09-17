module.exports = [
    {
        cron: '*/20 * * * *',
        handle: 'api/top',
        immediate: true
    },
    {
        cron: '*/30 * * * *',
        handle: 'api/geo',
        immediate: true
    }
]