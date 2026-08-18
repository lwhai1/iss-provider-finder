document.addEventListener('DOMContentLoaded', () => {
    const zipInput = document.getElementById('zipInput');
    const searchBtn = document.getElementById('searchBtn');
    const cardsContainer = document.getElementById('cardsContainer');
    const statsDiv = document.getElementById('stats');
    const loadingDiv = document.getElementById('loading');

    let allProviders = [];

    // 初始化获取数据
    fetchData();

    async function fetchData() {
        showLoading(true);
        try {
            const response = await fetch('data.json'); // 可替换为实际 API 端点
            if (!response.ok) throw new Error('网络请求错误');
            allProviders = await response.json();
            renderProviders(allProviders);
        } catch (error) {
            console.error('获取数据失败:', error);
            cardsContainer.innerHTML = '<p class="error">数据加载失败，请稍后重试。</p>';
        } finally {
            showLoading(false);
        }
    }

    function filterData() {
        const zipValue = zipInput.value.trim();

        if (!zipValue) {
            renderProviders(allProviders);
            return;
        }

        if (zipValue.length !== 5 || isNaN(zipValue)) {
            alert('请输入正确的5位数字邮政编码');
            return;
        }

        const filtered = allProviders.filter(item => {
            const itemZip = String(item.zipcode || item.zip || '').trim();
            return itemZip === zipValue;
        });

        renderProviders(filtered);
    }

    function renderProviders(data) {
        cardsContainer.innerHTML = '';
        statsDiv.textContent = `共找到 ${data.length} 家机构`;

        if (data.length === 0) {
            cardsContainer.innerHTML = '<p class="no-data">未找到符合条件的机构。</p>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${item.name || '未命名机构'}</h3>
                <p><strong>地址：</strong>${item.address || '暂无地址'}</p>
                <p><strong>邮编：</strong>${item.zipcode || item.zip || 'N/A'}</p>
                <p><strong>电话：</strong>${item.phone || '暂无电话'}</p>
                ${item.services ? `<p><strong>提供服务：</strong>${item.services.join(', ')}</p>` : ''}
            `;
            cardsContainer.appendChild(card);
        });
    }

    function showLoading(isLoading) {
        if (isLoading) {
            loadingDiv.classList.remove('hidden');
        } else {
            loadingDiv.classList.add('hidden');
        }
    }

    searchBtn.addEventListener('click', filterData);
    zipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterData();
        }
    });
});