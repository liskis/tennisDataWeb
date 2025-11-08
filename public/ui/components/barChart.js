// public/ui/components/barChart.js

export function createBarChartRow(label, data, color) {
    const row = document.createElement('div');
    row.className = 'chart-row';
    const countText = data.count !== undefined ? `(${data.count}/${data.total})` : `(${data.total})`;
    row.innerHTML = `<div class="label">${label}</div><div class="chart-wrapper"><div class="bar-background"><div class="bar-foreground" style="width: ${data.rate}%; background-color: ${color};"></div></div><div class="value-text">${data.rate.toFixed(1)}% ${countText}</div></div>`;
    return row;
}