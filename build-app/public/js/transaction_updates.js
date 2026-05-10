// Функция для обновления всех мест с транзакциями
function updateAllTransactionViews() {
    console.log('🔄 Принудительное обновление всех мест с транзакциями...');
    
    // Обновляем основную страницу
    loadTransactions();
    
    // Обновляем Admin панель если она открыта
    const adminTransactionsLink = document.querySelector('a[onclick*="loadTableData(\'transactions\')"]');
    if (adminTransactionsLink) {
        adminTransactionsLink.click();
    }
    
    // Обновляем статистику на главной странице
    updateTransactionStats();
}

// Функция для обновления статистики транзакций на главной странице
function updateTransactionStats() {
    apiRequest('/public/stats', 'GET')
        .then(stats => {
            if (stats && stats.transactions !== undefined) {
                const transactionStatsElements = document.querySelectorAll('[data-transaction-stats]');
                transactionStatsElements.forEach(element => {
                    element.textContent = stats.transactions;
                });
            }
        })
        .catch(error => {
            console.error('Ошибка обновления статистики транзакций:', error);
        });
}
