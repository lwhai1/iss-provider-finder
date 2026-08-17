// 页面初始化
document.addEventListener("DOMContentLoaded", () => {
    initCountyDropdown();
    runMatching();
});

// 初始化 County 下拉菜单
function initCountyDropdown() {
    const select = document.getElementById("countySelect");
    
    // 按字母顺序排列 Counties
    allCounties.forEach(county => {
        const option = document.createElement("option");
        option.value = county;
        option.textContent = county;
        select.appendChild(option);
    });
}

// 重置筛选
function resetFilters() {
    document.getElementById("filterForm").reset();
    runMatching();
}

// 核心匹配筛选引擎
function runMatching() {
    const selectedCounty = document.getElementById("countySelect").value;
    const citySearch = document.getElementById("citySearch").value.trim().toLowerCase();
    const nameSearch = document.getElementById("nameSearch").value.trim().toLowerCase();
    
    const reqISS = document.getElementById("reqISS").checked;
    const reqDAHS = document.getElementById("reqDAHS").checked;
    const reqRN = document.getElementById("reqRN").checked;
    const reqGtube = document.getElementById("reqGtube").checked;
    const reqAutism = document.getElementById("reqAutism").checked;
    const reqChinese = document.getElementById("reqChinese").checked;
    const reqTransport = document.getElementById("reqTransport").checked;

    const selectedPayers = Array.from(document.querySelectorAll(".payer-check:checked")).map(cb => cb.value);

    let results = [];

    allProviders.forEach(p => {
        let score = 100;
        let matchReasons = [];

        // 1. County 过滤
        if (selectedCounty !== "All" && p.county.toLowerCase() !== selectedCounty.toLowerCase()) {
            return;
        }

        // 2. 城市名称过滤
        if (citySearch && !p.city.toLowerCase().includes(citySearch) && !p.address.toLowerCase().includes(citySearch)) {
            return;
        }

        // 3. 机构名称搜索
        if (nameSearch && !p.name.toLowerCase().includes(nameSearch)) {
            return;
        }

        // 4. Program Type 需求判断
        if (reqISS) {
            if (p.isISS) {
                matchReasons.push("具备 HHSC ISS 社交与技能培养资质");
            } else {
                score -= 40;
            }
        }

        if (reqDAHS) {
            if (p.isDAHS) {
                matchReasons.push("具备 DAHS 日间护理/健康服务资质");
            } else {
                score -= 40;
            }
        }

        // 5. 软性护理能力评估与加分
        if (reqRN) {
            if (p.isDAHS) {
                matchReasons.push("具备 DAHS 配套 RN 护士健康监控");
                score += 10;
            } else {
                score -= 10;
            }
        }

        if (reqGtube) {
            if (p.isDAHS) {
                matchReasons.push("可提供高阶医疗与胃管/气切护理对接");
                score += 10;
            }
        }

        if (reqAutism) {
            if (p.isISS) {
                matchReasons.push("支持自闭症与发育迟缓社交行为训练");
                score += 10;
            }
        }

        if (reqChinese) {
            if (p.county.toLowerCase() === "harris" || p.county.toLowerCase() === "fort bend") {
                matchReasons.push("大休斯顿/福遍郡区域，高双语服务覆盖");
                score += 10;
            }
        }

        if (reqTransport) {
            matchReasons.push("标准提供轮椅无障碍班车服务");
        }

        // 6. 保险支持匹配
        if (selectedPayers.length > 0) {
            matchReasons.push("支持常规 Medicaid / STAR Kids / Waiver 对接");
        }

        // 分数截断
        score = Math.min(Math.max(score, 50), 99);

        results.push({
            ...p,
            matchScore: score,
            reasons: matchReasons
        });
    });

    // 依得分降序排列
    results.sort((a, b) => b.matchScore - a.matchScore);

    renderResults(results);
}

// 渲染结果
function renderResults(results) {
    const listContainer = document.getElementById("resultsList");
    const countContainer = document.getElementById("resultCount");
    
    countContainer.innerText = results.length;
    listContainer.innerHTML = "";

    if (results.length === 0) {
        listContainer.innerHTML = `
            <div class="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
                <i class="fa-solid fa-folder-open text-4xl mb-3 text-slate-300"></i>
                <p>未找到符合所有条件的机构，请尝试清除部分条件或选择“全州所有县”。</p>
            </div>
        `;
        return;
    }

    // 限制单页展示数量，防止卡顿，渲染前 100 家
    const displayList = results.slice(0, 100);

    displayList.forEach(p => {
        const card = document.createElement("div");
        card.className = "bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition relative";
        
        // 判定 Badge 样式
        let badgeStyle = "type-badge-dahs";
        if (p.type === "DAHS-ISS") badgeStyle = "type-badge-dual";
        else if (p.type === "DAHS-ISSONLY") badgeStyle = "type-badge-iss";

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2.5">
                <div>
                    <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-md ${badgeStyle}">${p.type}</span>
                    <h3 class="text-base font-bold text-slate-900 mt-1">${p.name}</h3>
                    <p class="text-xs text-slate-400">许可证号: ${p.licenseNo || 'Active'} | County: <span class="font-semibold text-slate-600">${p.county}</span> | 容量: ${p.capacity || 'N/A'} 人</p>
                </div>
                <div class="text-right">
                    <div class="match-score-badge text-white font-black text-base px-2.5 py-0.5 rounded-lg shadow-sm">
                        ${p.matchScore}%
                    </div>
                    <span class="text-[10px] text-slate-400">匹配契合度</span>
                </div>
            </div>

            <!-- 契合理由标签 -->
            <div class="flex flex-wrap gap-1.5 my-3">
                ${p.reasons.map(r => `<span class="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1"><i class="fa-solid fa-check text-green-500"></i> ${r}</span>`).join('')}
            </div>

            <!-- 联系方式与地址 -->
            <div class="border-t pt-3 flex flex-col sm:flex-row justify-between text-xs text-slate-600 gap-2">
                <span class="flex items-center gap-1.5"><i class="fa-solid fa-location-dot text-red-400"></i> ${p.address}</span>
                <div class="flex items-center gap-3">
                    ${p.phone ? `<a href="tel:${p.phone}" class="flex items-center gap-1 text-blue-600 font-semibold hover:underline"><i class="fa-solid fa-phone"></i> ${p.phone}</a>` : ''}
                    ${p.email ? `<a href="mailto:${p.email}" class="flex items-center gap-1 text-slate-500 hover:text-blue-600"><i class="fa-solid fa-envelope"></i> 邮件</a>` : ''}
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });

    if (results.length > 100) {
        const moreNotice = document.createElement("p");
        moreNotice.className = "text-center text-xs text-slate-400 py-3";
        moreNotice.innerText = `已为您优先展示前 100 家最匹配机构。缩小筛选范围可查看更精准结果。`;
        listContainer.appendChild(moreNotice);
    }
}

// 导出 PDF 报告
function exportPDF() {
    const element = document.getElementById("resultsList");
    const opt = {
        margin:       10,
        filename:     'Texas_HHSC_Provider_Match_Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
